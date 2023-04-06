import { LOGGLY_SUBDOMAIN, LOGGLY_TOKEN } from "../config";

const winston = require("winston");
require("winston-loggly-bulk");
try {
  winston.add(
    new winston.transports.Loggly({
      token: LOGGLY_TOKEN,
      subdomain: LOGGLY_SUBDOMAIN,
      tags: ["cdrive"],
      json: true,
    })
  );
} catch (error) {
  console.log("[Cdrive] Unable to load logging middleware");
}

// Middleware to log every request
export function logRequest(req, res, next) {
  const clientIP =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  winston.info("Request received", {
    method: req.method,
    url: req.url,
    ip: clientIP,
  });
  next();
}
