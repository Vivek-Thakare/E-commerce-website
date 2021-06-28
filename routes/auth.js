const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");

router.get("/login", authController.renderLoginForm);

router.post("/loginUser", authController.postLogin);

router.get("/registerForm", authController.renderRegisterForm);

router.post("/registerUser", authController.registerUser);

router.post('/logout', authController.logout);


module.exports = router;