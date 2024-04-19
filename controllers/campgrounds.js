const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
  const { pageCount = 1 } = req.query;
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds, pageCount });
};

module.exports.showPage = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: "author" })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find the Campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.newCampgroundForm = (req, res) => {
  res.render("campgrounds/new");
};
module.exports.editCampgroundForm = async (req, res) => {
  const { id } = req.params;
  const foundCampground = await Campground.findById(id);
  if (!foundCampground) {
    req.flash("error", "Cannot find the Campground to edit!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground: foundCampground });
};

module.exports.createNewCampground = async (req, res) => {
  // const geoData = await geocoder
  //   .forwardGeocode({
  //     query: req.body.campground.location,
  //     limit: 1,
  //   })
  //   .send();
  const campgroundImages = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  const campground = req.body.campground;
  // campground.geometry = geoData.body.features[0].geometry;
  const newCampground = new Campground(campground);
  newCampground.author = req.user;
  newCampground.images = campgroundImages;
  await newCampground.save();
  req.flash("success", "Created a new Campground");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // const geoData = await geocoder
  //   .forwardGeocode({
  //     query: req.body.campground.location,
  //     limit: 1,
  //   })
  //   .send();
  const updatingCampground = req.body.campground;
  // updatingCampground.geometry = geoData.body.features[0].geometry;
  const updatedCampground = await Campground.findByIdAndUpdate(
    id,
    updatingCampground,
    { new: true, runValidators: true }
  );
  if (!updatedCampground) {
    await new Campground(updatingCampground).save();
  }
  req.flash("success", "Edited the Campground!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.uploadImageForm = async (req, res) => {
  const { id } = req.params;
  const newImages = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  const updatingCampground = await Campground.findById(id);
  if (!updatingCampground) {
    req.flash("error", "Cannot find the Campground to upload images");
  } else {
    updatingCampground.images.push(...newImages);
    await updatingCampground.save();
    req.flash("Uploded an Image");
  }
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  if (!campground) {
    req.flash("error", "Cannot find the Campground to delete!");
    res.redirect("/campgrounds");
  }
  req.flash("success", "Deleted a Campground!");
  res.redirect("/campgrounds");
};

module.exports.deleteImagesForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/imagesIndex", { campground });
};

module.exports.deleteImages = async (req, res) => {
  const { id } = req.params;
  const { deleteImages } = req.body;
  if (deleteImages) {
    for (filename of deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    const campground = await Campground.findByIdAndUpdate(
      id,
      {
        $pull: { images: { filename: { $in: deleteImages } } },
      },
      { new: true, runValidators: true }
    );
    await campground.save();
    req.flash("success", "Deleted image(s) from campground");
  } else {
    req.flash("error", "could not delete image(s)");
  }
  res.redirect(`/campgrounds/${id}`);
};
