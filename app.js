if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//packages
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const session = require("express-session");
const flash = require("connect-flash");
const mongoDBStore = require("connect-mongo");

const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");

const usersRouter = require("./routes/users");
const campgroundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");

const ExpressError = require("./utilities/ExpressError");

//setup
const app = express();
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/yelpcamp";
mongoose
  .connect(dbURL)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Connection error!");
    console.log(err);
  });

//ejs
//app.engine sets the template engine callback (second parameter) for extensions (first parameter). Without setting it,
//express uses the default template engine.
app.engine("ejs", ejsMate);
//view engine settings set the default engine extensions to use when omitted while rendering.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//Security measures
app.use(mongoSanitize({ replaceWith: "_" }));
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://res.cloudinary.com/dcidbpjak/",
  "https://api.mapbox.com/mapbox-gl-js/v2.6.1/mapbox-gl.js",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://res.cloudinary.com/dcidbpjak/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://res.cloudinary.com/dcidbpjak/",
];
const fontSrcUrls = ["https://res.cloudinary.com/dcidbpjak/"];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dcidbpjak/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      mediaSrc: ["https://res.cloudinary.com/dcidbpjak/"],
      childSrc: ["blob:"],
    },
  })
);

//Mongo Session store instead of local store
const secret = process.env.SECRET || "thisisasecretinfo";
const store = mongoDBStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR!!", e);
});

//sessions and flashes
const sessionConfig = {
  name: "session",
  secret,
  store,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    // secure: true,
  },
};
app.use(session(sessionConfig));
app.use(flash());

//passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//locals to the views
app.use((req, res, next) => {
  if (!["/login", "/logout"].includes(req.originalUrl))
    req.session.returnTo = req.originalUrl;
  //to access req.user it should be after passport initialization
  res.locals.currentUser = req.user;
  res.locals.successMessage = req.flash("success");
  res.locals.failureMessage = req.flash("error");
  next();
});

//routers
app.use("/campgrounds", campgroundsRouter);
app.use("/campgrounds/:id/reviews/", reviewsRouter);
app.use("/", usersRouter);

//routes
app.get("/", (req, res) => {
  res.render("home");
});

//404 route
app.all("*", (req, res) => {
  throw new ExpressError("Page Not Found!", 404);
});

//error handling middleware
app.use((err, req, res, next) => {
  // console.log(err.message, err.name);
  const { status = 500, message = "Something went wrong", name } = err;
  if (name === "ValidationError")
    res
      .status(400)
      .render("error", { err, message: "Invalid Campground Data " });
  else if (name === "CastError") {
    res
      .status(400)
      .render("error", { err, message: "Invalid Campground ID Encountered" });
  } else {
    res
      .status(status)
      .render("error", { err, message, returnTo: req.session.returnTo });
  }
});

//start of local server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express application served over the port ${port}`);
});
