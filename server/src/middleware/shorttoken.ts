import { JWT_SECRET } from "../config";

const jwt = require("jsonwebtoken");


export const shortTokenValidator = (req, res, next) => {
  const { access_token } = req.query;

  try {
    const decodedToken = jwt.verify(access_token, JWT_SECRET);
    req.user = {
      id: decodedToken.user, // Extract the user ID or username from the token
    };
    next();
  } catch (err) {
    console.error("Invalid short token:", err);
    res.status(401).send("Unauthorized");
  }
}
