
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.ejs', { title: "Marauder's App" });
};
exports.hello = function(req, res){
  if (typeof req.session.oauth_access_token === 'undefined') {
    res.send("You are not logged in! Please log in.");
  } else {
    res.render('hello.ejs', { title: "hello world" });
  }
};
exports.tweet = function(oa, req, res){
  if (typeof req.session.oauth_access_token === 'undefined') {
    res.send("You are not logged in! Please log in.");
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