if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const localStratergy = require("passport-local");
const User = require("./models/user.js");
const { saveRedirectUrl } = require("./middleware.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;



port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', ejsMate);



main().then(() => {
  console.log("Connection to database successfull");
}).catch(err => {
  console.log(err);
  if (err.name === 'MongoNetworkError') {
    console.log("Possible IP Whitelist Issue: Please verify that your current IP address is whitelisted in MongoDB Atlas Network Access.");
  }
});

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}

// app.get("/",(req,res)=>{
//     res.send("All the rotes working and you are at root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(saveRedirectUrl);

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student"
  });
  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
})

//for the routes of listing
app.use("/listings", listingRouter);

//for the routes of reviews
app.use("/listings/:id/reviews", reviewRouter);

//for the routes of user
app.use("/", userRouter);



// Catch everything using a path that won't be parsed as a malformed token
app.use((req, res, next) => {
  next(new expressError(404, "Page not found"));
});


app.use((err, req, res, next) => {
  let { status = 500, message = "something went wrong" } = err;
  res.status(status).render("error.ejs", { message, status });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});