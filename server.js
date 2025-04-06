var express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render('pad');
});
app.get('/:id', function(req, res){
    res.render('pad');
})

var sharejs = require('share');
var redisClient;
console.log(process.env.REDISTOGO_URL);
if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    redisClient = require("redis").createClient(rtg.port, rtg.hostname);
    redisClient.auth(rtg.auth.split(":")[1]);
} else {
    redisClient = require("redis").createClient();
}

var options = {
    db: {type: 'redis', client: redisClient}
};

sharejs.server.attach(app, options);

var port = process.env.PORT || 8000;
app.listen(port);