const express = require("express");
const router = express.Router({ mergeParams: true });

//Error Handling utilities
const catchAsync = require("../utilities/catchAsync");

//passport
const passport = require("passport");

//controllers
const users = require("../controllers/users");

//routes
router
  .route("/register")
  .get(users.registerForm)
  .post(catchAsync(users.registered));

router
  .route("/login")
  .get(users.loginForm)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.loggedIn
  );

router.get("/logout", users.logout);

module.exports = router;
