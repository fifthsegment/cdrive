const {
    KEYCLOAK_REALM = "realm",
    KEYCLOAK_SECRET = "secret",
    MINIO_ENDPOINT = "localhost",
    MINIO_USE_SSL = "false",
    MINIO_ACCESS_KEY = "accesskey",
    MINIO_SECRET_KEY = "secretkey",
    MINIO_PORT = "38398",
    MINIO_BUCKET = "files",
    KEYCLOAK_SERVER_URL = "http://keycloak",
    KEYCLOAK_ADMIN_USER = "admin",
    KEYCLOAK_ADMIN_PASS = "admin",
    MONGO_URI = "mongodb://localhost:2717/",
    MONGO_DB = "",
    MONGO_HOST = "mongo",
    MONGO_PORT = "27017",
    MONGO_ADMIN_DB = "admin",
    MONGO_USER = "user",
    MONGO_PASS = "password",
    MONGO_ADMIN_USER = "mongodb",
    MONGO_ADMIN_PASS = "mongodb",
    IMAGEPROC_SERVER = "imagor",
    IMAGEPROC_SERVER_PORT = "8000",
    DOCUMENT_SERVER = "documents",
    DOCUMENT_SERVER_PORT = "9980",
    JWT_SECRET = "",
    SHORT_TOKEN_DURATION = 3600,
    KEYCLOAK_GOOGLE_CLIENTID = "",
    KEYCLOAK_GOOGLE_CLIENTSECRET = ""
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
    KEYCLOAK_ADMIN_PASS,
    MONGO_HOST,
    MONGO_PORT,
    MONGO_ADMIN_DB,
    MONGO_ADMIN_USER,
    MONGO_ADMIN_PASS,
    MONGO_USER,
    MONGO_PASS,
    IMAGEPROC_SERVER,
    IMAGEPROC_SERVER_PORT,
    MINIO_BUCKET,
    DOCUMENT_SERVER,
    DOCUMENT_SERVER_PORT,
    JWT_SECRET,
    SHORT_TOKEN_DURATION,
    KEYCLOAK_GOOGLE_CLIENTID,
    KEYCLOAK_GOOGLE_CLIENTSECRET
  }