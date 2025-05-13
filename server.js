require('dotenv').config(); 
var express = require("express");
const app = express();
const { URL } = require('url'); // For safe URL parsing in logs
const redis = require("redis"); // Will use redis@^2.8.0

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render('pad');
});
app.get('/:id', function(req, res){
    res.render('pad');
});

var sharejs = require('share');
var redisClient;

// Use REDIS_URL from Render, fallback to REDISTOGO_URL (for other environments if needed), then to local default
const connectionUrl = process.env.REDIS_URL || process.env.REDISTOGO_URL;
console.log("Attempting to connect to Redis.");

if (connectionUrl) {
    let loggedUrlString = connectionUrl;
    try {
        const parsedUrl = new URL(connectionUrl);
        if (parsedUrl.password) {
            parsedUrl.password = '****'; // Mask password for logging
        }
        loggedUrlString = parsedUrl.toString();
    } catch (parseError) {
        // Fallback for logging if not a standard URL, try simple regex mask
        loggedUrlString = connectionUrl.replace(/:([^:@\s]+)@/, ':****@');
        console.warn("Redis connection string could not be fully parsed as a URL for logging. Ensure it's correctly formatted.");
    }
    console.log("Using Redis configuration: " + loggedUrlString);

    // redis@^2.8.0 can take the URL string directly
    // It handles parsing the hostname, port, and authentication from the URL.
    redisClient = redis.createClient(connectionUrl, {
        // no_ready_check: true, // Uncomment if you face issues with Render Redis readiness checks
        // retry_strategy: function(options) { /* ... custom retry logic ... */ } // Optional: for more robust connections
    });
} else {
    console.log("Using local Redis default configuration (127.0.0.1:6379).");
    redisClient = redis.createClient();
}

redisClient.on('connect', function() {
    console.log('Successfully connected to Redis.');
});

redisClient.on('error', function (err) {
    console.error('Redis Error: ' + err.message);
    // Consider how critical Redis is. If the app can't run without it,
    // you might want to prevent startup or implement more robust error handling.
});

var options = {
    db: {type: 'redis', client: redisClient}
};

sharejs.server.attach(app, options);

var port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});