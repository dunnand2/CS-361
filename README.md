# CS 361 - Weather App
A weather web application that gets a weather report for a user entered city. A web scraper accesses the coordinates for the entered city from Wikipedia. These coordinates are used to request weather data from the openweathermap API. Supports current, hourly, and 7-day weather forecasts, as well as radar data imagery (built on mpabox and leaflet). An image of the city is also scraped from Wikipedia to be displayed alongside the weather report. 

Additionally, the image scraper can be utilized as a standalone service via an API request.

# Requests
The image scraper can be used by making a HTTP POST request to http://flip3.engr.oregonstate.edu:35351/api/image-scraper \
\
The API accepts one parameter:
* wikiURL: The Wikipedia page to parse

# Example Request
```json
{
"wikiURL":"https://en.wikipedia.org/wiki/Chicago"
}
```
# Response
The image scraper will return a direct link to the image from wikipedia.

# Example Response
```json
{
"imageURL":"//upload.wikimedia.org/wikipedia/commons/thumb/3/38/Chicago_montage1.jpg/300px-Chicago_montage1.jpg"
}
```
