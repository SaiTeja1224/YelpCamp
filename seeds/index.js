const mongoose = require("mongoose");
const Campground = require("../models/campground");

const { descriptors, places } = require("./seedHelpers");
const cities = require("./cities");

mongoose
  .connect("mongodb://localhost:27017/yelpcamp")
  .then(() => {
    console.log("From Seed : MongoDB connected on the port 27017");
  })
  .catch((err) => {
    console.log("From Seed : Connection error!");
    console.log(err);
  });

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const randomCity = Math.floor(Math.random() * cities.length);
    const randomDescriptors = Math.floor(Math.random() * descriptors.length);
    const randomPlaces = Math.floor(Math.random() * places.length);
    const price = Math.floor(Math.random() * 20) + 10;
    await new Campground({
      name: `${descriptors[randomDescriptors]} ${places[randomPlaces]}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[randomCity]["longitude"],
          cities[randomCity]["latitude"],
        ],
      },
      location: `${cities[randomCity]["city"]}, ${cities[randomCity]["state"]}`,
      images: [
        {
          url: `https://res.cloudinary.com/dzmz6ns6s/image/upload/v1713502229/YelpCamp/naapkbkqdxwywcrvolus.jpg`,
          filename: "YelpCamp/naapkbkqdxwywcrvolus",
        },
        {
          url: `https://res.cloudinary.com/dzmz6ns6s/image/upload/v1713502229/YelpCamp/xsvvvmvvajgsjftktite.jpg`,
          filename: "YelpCamp/xsvvvmvvajgsjftktite",
        },
      ],
      author: "6621f2b7599aa9b4ce58c688",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nostrum repellendus facilis totam nobis nihil sunt, provident ipsum dolor ducimus! Ut minima soluta a repudiandae voluptate, officiis incidunt sunt aliquam assumenda.",
      price,
    }).save();
  }
  console.log("Done with seeding!!");
};

seedDb().then(() => {
  mongoose.connection.close();
});
