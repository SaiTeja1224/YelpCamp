const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const { review: reviewObj } = req.body;
  const campground = await Campground.findById(id);
  const review = new Review(reviewObj);
  review.author = req.user;
  campground.reviews.unshift(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created a new Review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(
    id,
    { $pull: { reviews: reviewId } },
    { new: true, runValidators: true }
  );
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a Review!");
  res.redirect(`/campgrounds/${id}`);
};
