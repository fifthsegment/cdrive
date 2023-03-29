const {
    KEYCLOAK_REALM = "realm",
    KEYCLOAK_SECRET = "secret",
    MINIO_ENDPOINT = "localhost",
    MINIO_USE_SSL = "false",
    MINIO_ACCESS_KEY = "accesskey",
    MINIO_SECRET_KEY = "secretkey",
    MINIO_PORT = "38398",
    KEYCLOAK_SERVER_URL = "http://keycloak",
    MONGO_URI = "mongodb://localhost:2717/",
    KEYCLOAK_ADMIN_USER = "admin",
    KEYCLOAK_ADMIN_PASS = "admin",
    MONGO_DB = ""
  } = process.env;

  export {
    KEYCLOAK_REALM,
    KEYCLOAK_SERVER_URL,
    KEYCLOAK_SECRET,
    MINIO_ENDPOINT,
    MINIO_USE_SSL,
    MINIO_PORT,
    MONGO_URI,
    MONGO_DB,
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    KEYCLOAK_ADMIN_USER,
    KEYCLOAK_ADMIN_PASS
  }