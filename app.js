require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const crudRoutes = require("./routes/crud");
const authRoutes = require("./routes/auth");
const User = require("./model/user");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.83uvt.mongodb.net/top-moviesDB?retryWrites=true&w=majority`;
const app = express();
const main = async () => {
  await mongoose.connect(MONGODB_URI);
};

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
store.on("error", function (error) {
  throw error;
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  require("express-session")({
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  next();
});

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.user = user;
    req.isAuthenticated = req.session.isAuthenticated;
    next();
  } catch (err) {
    next(new Error(err));
  }
});

app.use(crudRoutes);
app.use("/auth", authRoutes);

app.use((req, res) => {
  const url = decodeURI(req.url);
  res.render("404", { url });
});

main()
  .then((connection) => {
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => {
    console.log(err);
  });
