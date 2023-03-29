import axios from "axios";
import {
  KEYCLOAK_ADMIN_PASS,
  KEYCLOAK_ADMIN_USER,
  KEYCLOAK_SERVER_URL,
} from "../config";

const keycloakBaseUrl = `${KEYCLOAK_SERVER_URL}/auth`;
const adminUsername = KEYCLOAK_ADMIN_USER;
const adminPassword = KEYCLOAK_ADMIN_PASS;
const clientId = "admin-cli"; // Default admin client ID

interface AccessTokenResponse {
  access_token: string;
}

async function getAdminAccessToken(): Promise<string> {
  const response = await axios.post<AccessTokenResponse>(
    `${keycloakBaseUrl}/realms/master/protocol/openid-connect/token`,
    null,
    {
      params: {
        grant_type: "password",
        client_id: clientId,
        username: adminUsername,
        password: adminPassword,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
}

async function createRealm(realmJson: object): Promise<void> {
  const accessToken = await getAdminAccessToken();

  try {
    console.log(`Attempting to create a realm on ${keycloakBaseUrl}/admin/realms`)
    const response = await axios.post(
      `${keycloakBaseUrl}/admin/realms`,
      realmJson,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Realm created successfully:", response.data);
  } catch (error) {
    console.error("Error creating realm:", error.response.data);
  }
}

const realmJson = {
  id: "myrealm",
  realm: "myrealm",
  displayNameHtml: "Login",
  enabled: true,
  registrationAllowed: false,
  registrationEmailAsUsername: false,
  verifyEmail: false,
  resetPasswordAllowed: true,
  sslRequired: "none",
  accessTokenLifespan: 315,
  accessCodeLifespan: 300,
  notBefore: 0,
  roles: {
    realm: [
      {
        name: "user",
        description: "User privileges",
      },
      {
        name: "admin",
        description: "Administrator privileges",
      },
    ],
  },
  users: [
    {
      username: "user",
      enabled: true,
      email: "sample-user@example",
      firstName: "Sample",
      lastName: "User",
      credentials: [{ type: "password", value: "password" }],
      realmRoles: ["user"],
      clientRoles: {
        account: ["view-profile", "manage-account"],
      },
    },
  ],
  clients: [
    {
      clientId: "myclient",
      enabled: true,
      publicClient: true,
      directAccessGrantsEnabled: true,
      clientAuthenticatorType: "client-secret",
      secret: "myclientsecret",
      redirectUris: ["*"],
      webOrigins: ["*"],
      defaultRoles: ["user"],
      defaultClientScopes: ["email", "profile", "roles"],
    },
  ],
  scopeMappings: [
    {
      client: "myclient",
      roles: ["user"],
    },
  ],
  clientScopeMappings: {
    account: [
      {
        client: "myclient",
        roles: ["view-profile"],
      },
    ],
  },
  userFederationProviders: [],
};
export const initKeycloak = async () => {
  try {
    await createRealm(realmJson);
  } catch (error) {
    console.error("Error executing createRealm function:", error);
  }
};
