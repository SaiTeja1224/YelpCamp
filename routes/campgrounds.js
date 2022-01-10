//express
const express = require("express");
const router = express.Router();

//Error Handling utilities
const catchAsync = require("../utilities/catchAsync");

//controllers
const campgrounds = require("../controllers/campgrounds");

//cloudinary storage
const { storage } = require("../cloudinary");

//middlewares
const {
  isLoggedIn,
  isCampgroundAuthor,
  validateCampgroundForm,
  validateImageForm,
} = require("../middlewares/middleware");

const multer = require("multer");
const upload = multer({ storage });

//routes
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampgroundForm,
    validateImageForm,
    catchAsync(campgrounds.createNewCampground)
  );

router.get("/new", isLoggedIn, campgrounds.newCampgroundForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showPage))
  .put(
    isLoggedIn,
    isCampgroundAuthor,
    validateCampgroundForm,
    catchAsync(campgrounds.updateCampground)
  )
  .patch(
    isLoggedIn,
    isCampgroundAuthor,
    upload.array("image"),
    validateImageForm,
    catchAsync(campgrounds.uploadImageForm)
  )
  .delete(
    isLoggedIn,
    isCampgroundAuthor,
    catchAsync(campgrounds.deleteCampground)
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isCampgroundAuthor,
  catchAsync(campgrounds.editCampgroundForm)
);

router
  .route("/:id/images")
  .get(isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteImagesForm))
  .delete(isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteImages));

module.exports = router;

//router.route groups together multiple same url into a single url and we can chain on different http verbs.

//form can submit files only by setting enctype attribute to multipart/form-data
//multer middleware parses any file sent from a form into a object i.e: req.file or req.files. upload.single(name). name of
//the form control/field which is used to send a file. upload.array(name) can get multiple files under the "name" field.
