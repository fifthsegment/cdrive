import Keycloak from "keycloak-js";
import { SERVER_BASE_URL } from "./contants";

const keycloak = new Keycloak({
  url: `${SERVER_BASE_URL}/auth`,
  realm: "myrealm",
  clientId: "myclient",
});

export default keycloak;
