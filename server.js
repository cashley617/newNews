// List of dependencies 
const express = require('express'),
    mongoose = require('mongoose'),
    exphbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    path = require('path'),
    favicon = require('serve-favicon');

// Scraping 
const cheerio = require('cheerio'),
    // request = require('request');
    axios = require('axios');

// Require models 
const db = require('./models');

// Initialize app 
const PORT = process.env.PORT || 3000;
const app = express(); 

// Configure the DB 
// const config = require('./config/database');
//     mongoose.Promise = Promise;
//     mongoose.connect(config.database)
//         .then( result => {
//             console.log('Connected to db ' ${result.connections[0].name}' on${result')
//         })

// Configure Favicon middleware 
app.use(favicon(path.join(__dirname, 'public', 'assets/img/favicon.ico')));

// Configure the Morgan middleware 
app.use(logger('dev'));

// Body-parser for forms 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Serves public folder for static directory 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/articles', express.static(path.join(_dirname, 'public')));
app.use('/notes', express.static(path.join(_dirname, 'public')));

// Connect to Mongo DB 
mongoose.connect("mongodb://localhost/unit18Populater", {
  useNewUrlParser: true
});


// Routes 
// const index = require('./routes/index'),
//     articles = require('./routes/articles'),
//     notes = require('./routes/notes'),
//     scrape = require('./routes/scrape'); 

// app.use('/', index);
// app.use('/articles', articles);
// app.use('/notes', notes);
// app.use('/scrape', scrape); 

// GET Route to scrape 
app.get('/scrape', function(req, res) { 
    axios.get("http://https://www.aljazeera.com/").then(function(response) {
        let $ = cheerio.load(response.data); 

        // Secure h2 sections in article 
        $('article h2').each(function(i, element) {
            let result = {}; 

            result.title = $(this) 
                .children('a')
                .text(); 
            result.link = $(this) 
                .children('a')
                .attr("href");

            // New Article 
            db.Article.create(result) 
                .then(function(dbArticle) {
                    console.log(dbArticle)
                })
                .catch(function(err) { 
                    console.logg(err)
                });
        });

        res.send("Your scrape is done!");
    });
});

// Route to get Articles 
app.get('/articles', function(req, res) {
    db.Article.find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
    .catch(function(err) {
        res.json(err);
    });
});

// Route to get Article by id
app.get('/articles/:id', function(req, res) { 
    db.Article.findOne({_id: req.params.id })
        .populate('note')
        .then(function(dbArticle) { 
            res.json(dbArticle);
        })
        .catch(function(err) { 
            res.json(err);
        });
});

// Route to save Article note 
app.post('/articles/:id', function(req, res) { 
    db.Note.create(req.body) 
        .then(function(dbNote) { 
            return db.Article.findOneAndUpdate({_id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function(dbArticle) { 
            res.json(dbArticle);
        })
        .catch(function(err) { 
            res.json(err);
        });
});

// Server 
app.listen(PORT, function() {
    console.log('Listening on PORT: ');
});
