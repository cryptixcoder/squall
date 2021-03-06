var TwitterStrategy = require('passport-twitter').Strategy;

var Users = require('./../models/users');
if (process.env.NODE_ENV === 'production') {
    var constants = require('./constants.production.js');
} else {
    var constants = require('./constants.js');
}

module.exports = function (passport) {

  passport.serializeUser(function (user, done) {
    console.log('serializing: ' + user.username);
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    console.log('deserializing: ' + id);
    Users.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Logic for twitter strategy
  passport.use(new TwitterStrategy({
    consumerKey : constants.Twitter.KEY,
    consumerSecret : constants.Twitter.SECRET,
    callbackURL: constants.Twitter.CALLBACK
  }, function(token, tokenSecret, profile, done) {
    console.log('twitter authentication for ' + profile.username);


    Users.findOne({ twId : profile.id }, function(err, oldUser) {
      if (oldUser) {
        // found existing user
        return done(null, oldUser);
      }

      if (err) {
        // something bad happened
        return done(err);
      }

      // If user doesn't exist create a new one
      var newUser = new Users({
        twId: profile.id,
        name: profile.displayName,
        username: profile.username,
        photo: profile.photos[0].value || '',
        access_token: token,
        access_token_secret: tokenSecret
      }).save(function(err, newUser) {
        if (err) throw err;
        console.log("saved and done");
        return done(null, newUser);
      });
    });
  }));

}
