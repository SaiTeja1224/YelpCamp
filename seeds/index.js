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
          url: "https://res.cloudinary.com/dcidbpjak/image/upload/v1640605743/YelpCamp/ludhfwqcmcangbovdyub.png",
          filename: "YelpCamp/ludhfwqcmcangbovdyub",
        },
        {
          url: "https://res.cloudinary.com/dcidbpjak/image/upload/v1640605745/YelpCamp/krlkyq5ugobi9dxxyfgk.png",
          filename: "YelpCamp/krlkyq5ugobi9dxxyfgk",
        },
      ],
      author: "61c55e723847378f3e9f8b85",
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
