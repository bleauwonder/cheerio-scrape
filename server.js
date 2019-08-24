var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Make public a static folder
app.use(express.static("public"));

require("./htmlRoutes")(app);

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// GET route
app.get("/scrape", function(req, res) {
  axios.get("https://www.nationalenquirer.com/crime-investigation/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("article").each(function(i, element) {
      var result = {};

      result.image = $(this)
        .children("a")
        .children(".post-image")
        .children("div")
        .children(".centring-box")
        .children("div")
        .children("img")
        .attr("src");
        console.log(result.image);
      result.title = $(this)
        .children("a")
        .children(".post-detail")
        .children(".promo-title")
        .text().trim();
      result.summary = $(this)
        .children("a")
        .children("div")
        .children(".post-excerpt")
        .children("p")
        .text().trim();
      result.link = $(this)
        .children("a")
        .attr("href");

      console.log(result);

      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");

  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).limit(5)
    .then(function(dbArticle) {
      // console.log("logging" + dbArticle);
      let allArticles = {
        articles: dbArticle
      };
      // res.json(dbArticle);
      res.render("index", allArticles);
    })
    .catch(function(err) {

      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbComment._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
