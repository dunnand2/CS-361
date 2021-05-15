const fetch = require('isomorphic-fetch')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const http = require('http');
var CORS = require('cors');
var express = require('express');

var app = express();

app.set('port', 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(CORS());


app.get('/', function (req, res, next){
    res.send("Hello World");
})

app.post('/', function (req, res, next) {
    (async () => {
        city = req.body.city;
        state = req.body.state;
        city_url = 'https://en.wikipedia.org/wiki/' + city + ',_' + state;
        const response = await fetch(city_url);
        const text = await response.text();
        const dom = await new JSDOM(text);
        let content = dom.window.document.getElementById("mw-content-text");
        let mainImage = content.getElementsByTagName("img");
        let latitude = dom.window.document.getElementsByClassName("latitude")[0].textContent;
        let longitude = dom.window.document.getElementsByClassName("longitude")[0].textContent;
        body = JSON.stringify({
            lat: latitude.toString(),
            long: longitude.toString(),
            imageURL: mainImage[0].src
        });
        res.setHeader("Access-Control-Allow-Origin", "http://web.engr.oregonstate.edu");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.send(body);
      })()

});

app.post('/image-scraper', function (req, res, next) {
    (async () => {
        url = req.body.wikiURL;

        city_url = 'https://en.wikipedia.org/wiki/' + city + ',_' + state;
        const response = await fetch(url);
        const text = await response.text();
        const dom = await new JSDOM(text);
        let content = dom.window.document.getElementById("mw-content-text");
        let mainImage = content.getElementsByTagName("img");
        let latitude = dom.window.document.getElementsByClassName("latitude")[0].textContent;
        let longitude = dom.window.document.getElementsByClassName("longitude")[0].textContent;
        body = JSON.stringify({
            lat: latitude.toString(),
            long: longitude.toString(),
            imageURL: mainImage[0].src
        });
        res.setHeader("Access-Control-Allow-Origin", "http://web.engr.oregonstate.edu");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.send(body);
      })()

});

app.use(function (req, res) {
    res.status(404);
    res.send('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.send('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
