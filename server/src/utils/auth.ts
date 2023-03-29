const passport = require("passport");
const KeycloakBearerStrategy = require("passport-keycloak-bearer");
import {
  KEYCLOAK_REALM,
  KEYCLOAK_SERVER_URL,
  KEYCLOAK_SECRET,
} from "../config";
import { User } from "../types/user";

const keycloakConfig = {
  realm: KEYCLOAK_REALM,
  url: KEYCLOAK_SERVER_URL,
  credentials: { secret: KEYCLOAK_SECRET },
};

export const configurePassport = async () => {
  passport.use(
    "passport-keycloak-bearer",
    new KeycloakBearerStrategy(keycloakConfig, (payload, done) => {
      const user = {
        id: payload.email,
        kcid: payload.sub,
        name: payload.name,
        email: payload.email,
      } as User;

      return done(null, user);
    })
  );
};
