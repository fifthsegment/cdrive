import { MINIO_PORT, MINIO_USE_SSL } from "../config";
import { initKeycloak } from "../utils/keycloak";

const express = require('express');

const router = express.Router();

const port = MINIO_PORT;
const useSSL = (MINIO_USE_SSL || "false").toLowerCase() === "true";

router.get("/", async (req, res) => {
    const output = {
        fileserverPort: port,
        fileserverSSL: useSSL
    }
    res.json(output)
});

export default router;
