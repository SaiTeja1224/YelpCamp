//server side validator
const Campground = require("../models/campground");
const Review = require("../models/review");
const {
  campgroundJoiSchema,
  reviewJoiSchema,
  imageJoiSchema,
} = require("../schema");
const ExpressError = require("../utilities/ExpressError");

//middlewares
const validateCampgroundForm = function (req, res, next) {
  //validation schema on the server side before entering into mongoDB
  const { error } = campgroundJoiSchema.validate(req.body);

  if (error) {
    const msg1 = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg1, 400);
  }
  next();
};

const validateReviewForm = function (req, res, next) {
  //validation schema on the server side before entering into mongoDB
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    next(new ExpressError(msg, 400));
  }
  next();
};

const validateImageForm = function (req, res, next) {
  const { error: imageError } = imageJoiSchema.validate(req.files);
  if (imageError) {
    const msg2 = imageError.details.map((el) => el.message).join(",");
    throw new ExpressError(msg2, 400);
  }
  next();
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("error", "Need to be logged in");
    res.redirect("/login");
  }
};

const isCampgroundAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You are not permitted to access the page");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId).populate("author");
  if (!req.user._id.equals(review.author._id)) {
    req.flash("error", "You are not permitted to delete this review");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isLoggedIn = isLoggedIn;
module.exports.isCampgroundAuthor = isCampgroundAuthor;
module.exports.isReviewAuthor = isReviewAuthor;
module.exports.validateCampgroundForm = validateCampgroundForm;
module.exports.validateReviewForm = validateReviewForm;
module.exports.validateImageForm = validateImageForm;
