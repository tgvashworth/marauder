/**
 * Routes
 */

// Serve the home page
exports.index = function(req, res){
  if (typeof req.session.oauth_access_token === 'undefined') {
    res.render('index.ejs', { title: "Marauder's App" });
  } else {
    res.render('menu.ejs', { title: "Main menu" });
  }
};

// Show a map for the requested hashtag
exports.to = function(locations, req, res) {
  var hashtag = '#' + req.params.hashtag;
  if(req.params.hashtag && locations[hashtag]) {

    console.log('Sending location data for hashtag', hashtag);
    res.render('map.ejs', {hashtag: hashtag, title: 'To ' + hashtag});

  } else {
    res.redirect('/');
  }
};

// Retrieve locations for the specified hastag (in the query string)
exports.getlocation = function(locations, req, res){
  var hashtag = '#' + req.params.hashtag;
  console.log(req.params, hashtag, locations);
  if(req.params.hashtag && locations[hashtag]) {
    console.log('Sending location data for hashtag', hashtag);
    res.send(JSON.stringify(locations[hashtag]));
  } else {
    res.send('Hashtag not found');
  }
};

// POST a location with an associated hastag and store
// it in the locations object
exports.setlocation = function(locations, req, res){
  if (typeof locations[req.body.hashtag] === 'undefined') {
    locations[req.body.hashtag] = {
      lat: req.body.lat,
      lng: req.body.lng
    };
  }
  console.log(locations);
  res.send(JSON.stringify(locations));
};

// Send a tweet!
exports.tweet = function(oa, req, res){
  return;
  if (typeof req.session.oauth_access_token === 'undefined') {
    res.redirect('/');
  } else {

    var body = {
      status: 'Look how good we are - this is our first auto tweet with Node! #YRS2012'
    };

    var endpoint = "http://api.twitter.com/1/statuses/update.json";
    var token = req.session.oauth_access_token;
    var secret = req.session.oauth_access_token_secret;

    oa.post(endpoint, token, secret, body, "application/json", function (error, data, response) {
      if(error){
          console.log('Error: Something is wrong.\n'+JSON.stringify(error)+'\n');
          for (var i in response) {
            out = i + ' : ';
            try {
          out+=response[i];
            } catch(err) {}
            out += '/n';
            console.log(out);
        }
      }else{
          console.log('Twitter status updated.\n');
          console.log(response+'\n');
      }
    });
    res.render('tweet.ejs', { title: "Tweet" });
  }
};