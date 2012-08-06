
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.ejs', { title: "Marauders' App" });
};
exports.hello = function(req, res){
  if (typeof req.session.oauth_access_token === 'undefined') {
    res.send("You are not logged in");
  } else {
    res.render('hello.ejs', { title: "hello world" });
  }
};