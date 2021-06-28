const path = require("path");

const express = require("express");
const session = require("express-session");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const flash = require("connect-flash");
const multer = require("multer");

const app = express();

//Associations add a default methods for ex "user has many products" so it will create a user.createProduct method automatically;
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });


const store = new SequelizeStore({
  db: sequelize,
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.filename + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true);
  }else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(express.urlencoded({ extended: false })); //for text data only.
app.use(multer({ dest: "images", storage: fileStorage , fileFilter:fileFilter }).single("image")); //'image' is the name of input feild
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "Re@perEncoded",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie : {
      maxAge: 172800000  //expire after 2 days, if not specified the user will have to login after browser closes.
  },
  })
);

app.use(flash());

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findByPk(req.session.user.id); //fetching the user id after logging in, and then setting the user object accodingly
    if (user) {
      req.user = user;
      next();
    }
  } catch (err) {
    console.log(err);
  }
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLogged; //'res.locals' allows us to set local variables for your 'views'.
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use("/auth", authRoutes);
app.use(errorController.get404);



sequelize
  // .sync({ force: true }) //to alter already existing tables
  .sync()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
