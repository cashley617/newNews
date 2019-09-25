
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
mongoose.connect("mongodb://localhost/unit18PopulaterNew", { useNewUrlParser: true });
    // var databaseUrl = "news";
    // mongoose.Promise = Promise;
    // var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";
    // mongoose.connect(MONGODB_URI);

// Routes

// GET route to scrape 
// app.get("/scrape", function (req, res) {
//     axios.get("http://www.echojs.com/").then(function (response) {
//         var $ = cheerio.load(response.data);

//         // Get h2s
//         $("article h2").each(function (i, element) {
//             var result = {};
//             result.title = $(this)
//                 .children("a")
//                 .text();
//             result.link = $(this)
//                 .children("a")
//                 .attr("href");

//             // Create a new Article
//             db.Article.create(result)
//                 .then(function (dbArticle) {
//                 })
//                 .catch(function (err) {
//                     console.log(err);
//                 });
//         });

//         // Send message
//         res.send("Scrape Complete");
//     });
// });


// Version 1 for Al Jazeera
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.aljazeera.net/news").then(function(response) {

      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);


        // $(".story-information").each((i, element) => {
        //     // console.log()
        //   console.log($(element).find("a").attr("href"));
        // });
        $(".story-information").each((i, element) => {
            // Save result object 
            let result = {}; 


            // // Add the text 
            result.title = $(element) 
                .find("a")
                // .attr("href");

            result.link = $(element)
                .find("a")
                .children($(".greta"))
                .text()

            // console.log($(element).find("a").attr("href"));
            // console.log(
            //     $(element)
            //         .find("a")
            //         // .children("p.greta")
            //         .children($(".greta"))
            //         .text()
            // );
            
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

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

