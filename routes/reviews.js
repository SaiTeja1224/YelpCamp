//express
const express = require("express");
const router = express.Router({ mergeParams: true });

//Error Handling utilities
const catchAsync = require("../utilities/catchAsync");

//controllers
const reviews = require("../controllers/reviews");

//middlewares
const {
  validateReviewForm,
  isLoggedIn,
  isReviewAuthor,
} = require("../middlewares/middleware");

//routes
router.post(
  "/",
  isLoggedIn,
  validateReviewForm,
  catchAsync(reviews.createReview)
);

router.delete("/:reviewId", isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;

//router params and app params are seperate by default. They have their own parameter lists. So if we want to access app
//parameters in the router files we specify an option in the Router(option) - mergeParams : true this will combine app
// and router parameters and will be available throughout.
