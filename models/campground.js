const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema(
  {
    url: String,
    filename: String,
  },
  opts
);

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200,h_140");
});

const campgroundSchema = new Schema(
  {
    name: String,
    price: Number,
    images: [imageSchema],
    description: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  opts
);

campgroundSchema.virtual("properties.popupMarkup").get(function () {
  let html = `<strong><a href='/campgrounds/${this._id}'>${this.name}</a><strong>`;
  return html;
});

campgroundSchema.post("findOneAndDelete", async function (campground) {
  if (campground) {
    const reviews = campground.reviews;
    if (reviews) {
      const res = await Review.deleteMany({ _id: { $in: reviews } });
      console.log(res);
    }
    //Simple way
    // if (reviews) {
    //   for (let review of reviews) {
    //     await Review.findByIdAndDelete(review._id);
    //   }
    // }
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);