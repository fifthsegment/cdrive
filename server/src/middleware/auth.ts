const passport = require('passport');


export const validateUser = (req, res, next) => {
    passport.authenticate('passport-keycloak-bearer', { session: false }, (err, appUser) => {
      if (err) return next(err);
      if (appUser) req.appUser = appUser;
      next();
    })(req, res, next);
  };
