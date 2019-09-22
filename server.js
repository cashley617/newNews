
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scraping
var axios = require("axios");
var cheerio = require("cheerio");

// Models
var db = require("./models");

var PORT = 3000;

// Initialize App
var app = express();

// Middleware

// Morgan logs requests
app.use(logger("dev"));

// Parses as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Uses public folder
app.use(express.static("public"));

// Connecting to Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
    // var databaseUrl = "news";
    // mongoose.Promise = Promise;
    // var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";
    // mongoose.connect(MONGODB_URI);

// Routes

// GET route to scrape 
app.get("/scrape", function (req, res) {
    axios.get("http://www.echojs.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        // Get h2s
        $("article h2").each(function (i, element) {
            var result = {};
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article
            db.Article.create(result)
                .then(function (dbArticle) {
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        // Send message
        res.send("Scrape Complete");
    });
});


// Version 1 for Al Jazeera
// app.get("/scrape", function (req, res) {
//     // First, we grab the body of the html with axios
//     axios.get("https://www.aljazeera.net/news").then(function(response) {
//       // Then, we load that into cheerio and save it to $ for a shorthand selector
//       let $ = cheerio.load(response.data);

//       // Now, we grab every h2 within an article tag, and do the following:
//       $("h2").each(function(i, element) {
//         // Save an empty result object
//         var result = {};

//         // Add the text and href of every link, and save them as properties of the result object
//         result.title = $(element)
//             .find("textContent")
//             .text()
//             .text();
//         result.innerHTML = $(element)
//             .find("innterHTML")
//             .attr("href");
//         result.image = $(element)
//             .children("source")
//             .attr("data-srcset");

//         // Create a new Article using the `result` object built from scraping
//         db.Article.create(result)
//           .then(function(dbArticle) {
//             // View the added result in the console
//             console.log(dbArticle);
//           })
//           .catch(function(err) {
//             // If an error occurred, log it
//             console.log(err);
//           });
//       });

//       // Send a message to the client
//       res.send("Scrape Complete");
//     });
// });

// Version 2 for Al Jazeera
// app.get("/scrape", function (req, res) {
//     axios.get("https://www.aljazeera.net/news").then(function (response) {
//       // Load the html body from request into cheerio
//       var $ = cheerio.load(response.data);
//       $("h2").each(function(i, element) {
//         // trim() removes whitespace because the items return \n and \t before and after the text
//         var title = $(element)
//           .find("textContent")
//           .text()
//           .trim();
//         var link = $(element)
//           .find("innterHTML")
//           .attr("href");
//         // var intro = $(element)
//         //   .children(".post-block__content")
//         //   .text()
//         //   .trim();

//         // if these are present in the scraped data, create an article in the database collection
//         if (title && link && intro) {
//           db.Article.create(
//             {
//               title: title,
//               link: link,
//             //   intro: intro
//             },
//             function(error, inserted) {
//               if (error) {
//                 // log the error if one is encountered during the query
//                 console.log(error);
//               } else {
//                 // otherwise, log the inserted data
//                 console.log(inserted);
//               }
//             }
//           );
//           // if there are 10 articles, then return the callback to the frontend
//           console.log(i);
//           if (i === 10) {
//             return res.sendStatus(200);
//           }
//         }
//       });
//     });
// });


// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's Note
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

