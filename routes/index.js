/**
 * Routes
 */

// Serve the home page
exports.index = function(req, res){
  if (typeof req.session.oauth_access_token === 'undefined') {
    res.render('index.ejs', { title: "Marauder's App" });
  } else {
    res.render('menu.ejs', { title: "Main menu", user_name: req.session.user_name });
  }
};

exports.newhashtag = function(req, res){
  if (typeof req.session.oauth_access_token === 'undefined') {
    res.redirect('/');
  } else {
    res.render('new.ejs', { title: "Create a New Hashtag!!!", user_name: req.session.user_name });
  }
};
// Show a map for the requested hashtag

exports.from = function(locations, req, res){
  if (typeof req.session.oauth_access_token === 'undefined') { res.redirect('/'); return; }

  var hashtag = '#' + req.params.hashtag;
  if(req.params.hashtag && locations[hashtag]) {
    res.render('map.ejs', {
      hashtag: hashtag,
      title: 'From ' + hashtag,
      is_from: true
    });
  } else {
    res.redirect('/');
  }
};

exports.to = function(locations, req, res) {
  // For now, kick out people who don't have an access token
  if (typeof req.session.oauth_access_token === 'undefined') { res.redirect('/'); return; }

  var hashtag = '#' + req.params.hashtag;
  if(req.params.hashtag && locations[hashtag]) {
    res.render('map.ejs', {
      hashtag: hashtag,
      title: 'To ' + hashtag,
      is_from: false
    });
  } else {
    res.redirect('/');
  }
};

// Retrieve locations for the specified hastag (in the query string)
exports.getlocation = function(locations, req, res){
  var hashtag = '#' + req.params.hashtag;
  if(req.params.hashtag && locations[hashtag]) {
    res.send(JSON.stringify(locations[hashtag]));
  } else {
    res.send('Hashtag not found');
  }
};

// POST a location with an associated hashtag and store
// it in the locations object
exports.setlocation = function(locations, req, res){
  
  // For now, kick out people who don't have an access token
  if (typeof req.session.oauth_access_token === 'undefined') { res.redirect('/'); return; }

  // Send a 400 (Bad Request) if they haven't sent the required params
  if(!(req.body.hashtag && req.body.lat && req.body.lng)) {
    res.send(400);
    return;
  }

  // Check if this hashtag exists
  if (typeof locations[req.body.hashtag] === 'undefined') {
    // Save and clean up the hashtag
    var hashtag = req.body.hashtag.toLowerCase();
    hashtag = hashtag.replace(/[^a-zA-Z0-9_#]/ig, '');
    var rawhash = hashtag;
    if( hashtag.match(/^#/) ) {
      rawhash = hashtag.slice(1);
    } else {
      hashtag = '#' + hashtag;
    }
    // We haven't seen this hashtag before, so create it!
    locations[hashtag] = {
      target: {
        lat:req.body.lat,
        lng:req.body.lng
      },
      marauders: []
    };

    // Send them to a event page
    res.redirect('/from/'+rawhash);
  } else {
    // Does the current user have a location_id stored?
    if(req.session.location_id === undefined) {
      // Add the new user to our list of marauders and store
      // and id, based on the access token, so we can retrieve them again
      locations[req.body.hashtag].marauders.push({
        id: req.session.oauth_access_token.slice(0,9),
        user_name: req.session.user_name,
        lat: req.body.lat,
        lng: req.body.lng
      });
      req.session.location_id = req.session.oauth_access_token.slice(0,9);
      // console.log("Recieved new location data from device.");
      // console.log(locations);
    } else {
      // We've already seen this user, so update their info
      locations[req.body.hashtag].marauders.forEach(function (marauder, index, marauders) {
        if(marauder.id === req.session.location_id) {
          marauders[index].lat = req.body.lat;
          marauders[index].lng = req.body.lng;
        }
      });
    }
    res.send(200);
  }
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