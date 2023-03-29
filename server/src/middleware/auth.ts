const passport = require('passport');

export const validateUser = passport.authenticate('passport-keycloak-bearer', { session: false })

