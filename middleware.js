module.exports = function(db) {
  return {
      requireAuthentication: function(req, res, next) {
          var token = req.get('Auth');
        console.log('Auth: ' + token);
          db.user.findByToken(token).then(function(user) {
             req.user = user;
              next();
          }, function() {
              console.log('**requireAuthentication failed');
              res.status(401).send();
          });
      }
  };
};