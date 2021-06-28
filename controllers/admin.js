const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const image = req.file; //for images, refer multer in app.js for more details
  const price = req.body.price;
  const genre = req.body.genre;

  const imageUrl = `/${image.path}`; // it stores path of image in the database, images must always be stored on file system.

  try {
    await req.user.createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: genre,
    });
    console.log("Created Product");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  try {
    const products = await req.user.getProducts({ where: { id: prodId } });
    // Product.findById(prodId)
    const product = products[0];
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedGenre = req.body.genre;

  try {
    const product = await Product.findByPk(prodId);

    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedGenre;
    if (image) {
      product.imageUrl = `/${image.path}`;
    }
    await product.save();
    console.log("UPDATED PRODUCT!");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.getProducts = async (req, res, next) => {
  console.log(req.user);
  try {
    const products = await req.user.getProducts();
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    const product = await Product.findByPk(prodId);
    await product.destroy();
    console.log("DESTROYED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};
