const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const https = require("https");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());

// Allow frontend/API communication
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "HustleHub+ API is running securely"
    });
});

// Load local SSL certificate
const sslOptions = {
    key: fs.readFileSync("certs/localhost-key.pem"),
    cert: fs.readFileSync("certs/localhost-cert.pem")
};

const PORT = process.env.PORT || 5000;

// Start HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HustleHub+ API running securely on https://localhost:${PORT}`);
});