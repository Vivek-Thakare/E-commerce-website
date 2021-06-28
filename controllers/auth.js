const User = require("../models/user");
const { Op } = require("sequelize");

exports.renderLoginForm = (req, res, next) => {
  //   const isLogged = req.get('Cookie').split("=")[1]; //getting the cookie which is set.
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/auth/login",
    pageTitle: "Login",
    error: message,
  });

};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({
      where: { [Op.and]: [{ email: email }, { password: password }] },
    });
    if (user) {
      req.session.user = user;
      req.session.isLogged = true;
      //need to call this method when redirecting, because it might take a few miliseconds to create session and redirect works independently.
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
      //   res.cookie("loggedIn", "true", {httpOnly:true});
    } else {
      req.flash("error", "Invalid username or password");
      console.log("Invalid username");
      return res.redirect("/auth/login");
    
    }
  } catch (err) {
    console.log(err);
  }
};

exports.renderRegisterForm = (req, res, next) => {
  res.render("auth/register", {
    path: "/auth/register",
    pageTitle: "Register",
  });
};

exports.registerUser = async (req, res, next) => {
  const firstname = req.body.first_name;
  const lastname = req.body.last_name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ where: { email: email } });
    console.log(user);
    if (user) {
      console.log("email already exists");
      res.redirect("/auth/registerForm");
    } else {
      const newUser = await User.create({
        name: `${firstname} ${lastname}`,
        email: email,
        password: password,
      });
      await newUser.createCart();
      console.log("created successfully");
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.logout = (req, res, next) => {
  console.log("logged out");
  req.session.destroy(() => {
    res.redirect("/");
  });
};
