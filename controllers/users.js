const User = require("../models/user");

module.exports.registerForm = (req, res) => {
  res.render("users/register");
};

module.exports.registered = async (req, res, next) => {
  try {
    const { username, password, email } = req.body.register;
    const newUser = await new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, function (err) {
      if (err) return next(err);
      req.flash("success", `User ${username} registered`);
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};
module.exports.loginForm = (req, res) => {
  res.render("users/login");
};
module.exports.loggedIn = (req, res) => {
  req.flash("success", `Welcome back ${req.body.username}`);
  const redirect = req.session.returnTo || "/campgrounds";
  res.redirect(redirect);
};
module.exports.logout = (req, res) => {
  req.logOut();
  req.flash("success", "Logged Out!");
  res.redirect("/");
};
