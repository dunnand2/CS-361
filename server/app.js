const fetch = require('isomorphic-fetch')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const http = require('http');
const CORS = require('cors');
const corsOptions = {origin: '*'};
const express = require('express');

const app = express();

app.set('port', 35351);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(CORS(corsOptions));


app.get('/api', function (req, res, next){
    res.send("Hello World");
})

app.post('/api', function (req, res, next) {
    (async () => {
        let cityURL = getCityURL(req);
        let response = await fetch(cityURL);
        if (!response.ok) {
            return res.status(response.status).send({
                message: response.statusText
            });
        } else{
            let dom = await getWikipediaDOM(response);
            let body = createResponseBody(dom);
            res.send(body);
        }
      })()
});

app.post('/api/image-scraper', function (req, res, next) {
    (async () => {
        url = req.body.wikiURL;
        let response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).send({
                message: response.statusText
            });
        } else {
            let text = await response.text();
            let dom = await new JSDOM(text);
            let content = dom.window.document.getElementById("mw-content-text");
            let mainImage = content.getElementsByTagName("img");
            body = JSON.stringify({
                imageURL: mainImage[0].src
            });
            res.send(body);
        }
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

const server = app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

module.exports = server;


function getCityURL (req) {
    let city = req.body.city;
    let state = req.body.state;
    return 'https://en.wikipedia.org/wiki/' + city + ',_' + state;
}

async function getWikipediaDOM(response) {
    let text = await response.text();
    let dom = await new JSDOM(text);
    return dom
}

function createResponseBody(dom) {
    // Query the main content of the wikipedia article
    let content = dom.window.document.getElementById("mw-content-text");
    
    // Assign the URL of the first image. Since we queried the main content, this will be the most prominent image of the article
    let mainImage = content.getElementsByTagName("img")[0];
    
    // Access first coordinate element and access data (all elements should have the same data)
    let latitude = dom.window.document.getElementsByClassName("latitude")[0].textContent;
    let longitude = dom.window.document.getElementsByClassName("longitude")[0].textContent;

    // package and return json data
    let body = JSON.stringify({
        lat: latitude.toString(),
        long: longitude.toString(),
        imageURL: mainImage.src
    });
    return body
}