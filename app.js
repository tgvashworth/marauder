/**
 * marauder.me
 *
 * I solemnly swear that I am up to no good
 */


/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes');

var app = module.exports = express.createServer();
var OAuth= require('oauth').OAuth;

var callback;

if(process.env.LIVE === "1") {
  callback = "http://marauder.me/auth/twitter/callback";
} else {
  callback = "http://localhost:"+process.env.PORT+"/auth/twitter/callback";
}

var oa = new OAuth(
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  "tTdkYrzeXE0STqZUtk6sbw",
  "nHASgwcOCbdMNo21VluxFptsAmtqTZBoVGeKqUEQ",
  "1.0",
  callback,
  "HMAC-SHA1"
);

// Store the current hashtag locations
var locations = {};

locations['#YRS'] = {
  target: {
    lat: '52.4831056',
    lng: '-1.8859758'
  },
  marauders: []
};
 
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(express.session({ secret: "daves poo" }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

app.get('/tweet', function(req, res) {
  // Pass oa to routes.tweet so that
  // we can send stuff to the Twitter API
  routes.tweet(oa, req, res);
});
app.get('/auth/twitter', function(req, res){
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if (error) {
      console.log(error);
      res.send("yeah no. didn't work.");
    }
    else {
      req.session.oauth = {};
      req.session.oauth.token = oauth_token;
      req.session.oauth.token_secret = oauth_token_secret;
      console.log('oauth.token: ' + req.session.oauth.token);
      console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
  }
  });
});
app.get('/auth/twitter/callback', function(req, res, next) {
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;

    oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,
    function(error, oauth_access_token, oauth_access_token_secret, results){
      if (error){
        console.log(error);
        res.send("yeah something broke.");
      } else {
        req.session.oauth_access_token = oauth_access_token;
        req.session.oauth_access_token_secret = oauth_access_token_secret;
        req.session.user_name = results.screen_name;
        req.session.user_id = results.user_id;
        res.redirect('/');
      }
    });
  } else {
    next(new Error("you're not supposed to be here."));
  }
});

app.get('/auth/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.get('/new', function (req, res){
 routes.newhashtag(req, res);
});

app.post('/new', function (req, res){
  routes.setlocation(locations, req, res);
});

app.post('/location', function (req, res) {
  routes.setlocation(locations, req, res);
});

app.get('/location/:hashtag', function (req, res) {
  routes.getlocation(locations, req, res);
});

app.get('/from/:hashtag', function (req, res) {
  routes.to(locations, req, res);
});

app.get('/to/:hashtag', function (req, res) {
  routes.to(locations, req, res);
});


app.listen(process.env.PORT);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
