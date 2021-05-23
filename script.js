let currentActive = currentTab;
let api_response = null;
let current_lat = null;
let current_long = null;
addEventListeners();
//requestRadarData();

function addEventListeners() {
    const searchButton = document.getElementById("Search");
    const currentTab = document.getElementById("currentTab");
    const hourlyTab = document.getElementById("hourlyTab");
    const dailyTab = document.getElementById("dailyTab");
    const radarTab = document.getElementById("radarTab");
    const testButton = document.getElementById("Test");

    searchButton.addEventListener("click", searchButtonClicked);
    currentTab.addEventListener("click", contentTabClicked);
    hourlyTab.addEventListener("click", contentTabClicked);
    dailyTab.addEventListener("click", contentTabClicked);
    radarTab.addEventListener("click", contentTabClicked);
    testButton.addEventListener("click", testButtonClicked);
}

async function testButtonClicked () {
    const serverURL = 'http://flip3.engr.oregonstate.edu:35351/api/image-scraper';
    let payload = JSON.stringify({wikiURL: "https://en.wikipedia.org/wiki/Chicago",})
    let response = await fetch(serverURL, {method: 'POST', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}, body: payload, mode: 'cors'});
    let body =  await response.json();
    let untransformedURL = "http:" + body.imageURL;
    displayImageContent(untransformedURL);
}

async function searchButtonClicked() {
    clearAllContent();
    let payload = createPayload();
    const serverURL = 'http://127.0.0.1:35351/api';
    //const serverURL = 'http://flip3.engr.oregonstate.edu:35351/'
    let response = await fetch(serverURL, {method: 'POST', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}, body: payload, mode: 'cors'});
    if (!response.ok) {
        displayError(response);
        return
    }
    let body =  await response.json();
    let weatherData = await getWeatherData(body);
    let untransformedURL = "http:" + body.imageURL;
    //let transformedURL = await transformFromURL(untransformedURL);
    saveWeatherData(weatherData);
    displayMainContent(weatherData, getActiveTab());
    writeAlerts(weatherData);
    displayImageContent(untransformedURL);
}

async function getWeatherData(scrapedResponse) {
    console.log(scrapedResponse);
    current_lat = convertLatitude(scrapedResponse.lat);
    current_long = convertLongitude(scrapedResponse.long);
    let weatherResponse = await fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + current_lat + '&lon=' + current_long + '&appid=26725991df4a07c7462c67cf12165745', {mode: 'cors'});
    return weatherResponse.json();
}

function requestRadarData() {
    clearMainContent();
    console.log("current lat: " + current_lat);
    console.log("current long: " +current_long);

    mapboxgl.accessToken = 'pk.eyJ1IjoiZHVubmFuZCIsImEiOiJja29zdGs5NGgwNDd3MzFvMTNiZGphMHhvIn0.ehUkvT41JA7bSKJVHKfVqA';

    /*var map = new mapboxgl.Map({
        container: 'mainContentContainer',
        style: 'mapbox://styles/mapbox/light-v10',
        zoom: 4,
        center: [-87.622088, 41.878781]
    });
    
    map.on('load', function(){
      map.addLayer({
        "id": "simple-tiles",
        "type": "raster",
        "source": {
          "type": "raster",
          "tiles": ["https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=874718354841f0e0250b4b06a05a971e"],
          "tileSize": 256
        },
        "minzoom": 0,
        "maxzoom": 22
      });
    });*/

    mapboxgl.accessToken = 'pk.eyJ1IjoiZHVubmFuZCIsImEiOiJja29zdGs5NGgwNDd3MzFvMTNiZGphMHhvIn0.ehUkvT41JA7bSKJVHKfVqA';
    var map = new mapboxgl.Map({
        container: 'mainContentContainer',
        style: 'mapbox://styles/mapbox/light-v10',
        zoom: 4,
        center: [current_long, current_lat]
    });
    
    map.on('load', function(){
      map.addLayer({
        "id": "simple-tiles",
        "type": "raster",
        "source": {
          "type": "raster",
          "tiles": ["https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=874718354841f0e0250b4b06a05a971e"],
          "tileSize": 256
        },
        "minzoom": 0,
        "maxzoom": 22
      });
    });

    
}

function lon2tile(lon,zoom) { 
    return (Math.floor((lon+180)/360*Math.pow(2,zoom))); 
}

function lat2tile(lat,zoom) { 
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); 
}

function saveWeatherData(response) {
    api_response = response;
}

async function transformFromURL(untransformedURL){
    const uri = 'http://flip2.engr.oregonstate.edu:59835/api/services/imageTransformer';
    const body = new FormData();
    let myTransformation = 'saturate';
    body.append('img', untransformedURL);
    body.append('transformation', myTransformation ?? '');
    try {
        const req = await fetch(uri, {method: 'POST', body: body, mode: 'cors'});
        if (!req.ok) {
            throw new Error(`HTTP error! status: ${req.status}`);
        }
        const response = await req.json();
        return response.imgUrl; 
    } catch (e) {
        return e.message;
    }
}

function createPayload() {
    let cityValue = getCityFormData();
    let stateValue = getStateFormData();
    return JSON.stringify({
        searchType: "City",
        city: cityValue,
        state: stateValue
    })
}

function getWindDirection(degree){
    if (degree >= 337.5 || degree < 22.5){
        return "North";
    }
    if (degree >= 22.5 && degree < 67.5){
        return "Northeast";
    }
    if (degree >= 67.5 && degree < 112.5){
        return "East";
    }
    if (degree >= 112.5 && degree < 157.5) {
        return "Southeast";
    }
    if (degree >= 157.5 && degree < 202.5) {
        return "South";
    }
    if (degree >= 202.5 && degree < 247.5) {
        return "Southwest";
    }
    if (degree >= 247.5 && degree < 292.5) {
        return "West";
    }
    if (degree >= 292.5 && degree < 337.5) {
        return "Northwest";
    }
}

function getCityFormData() {
    let cityInput = document.getElementById("searchForm");
    let cityValue = cityInput.value;
    return cityValue
}

function getStateFormData() {
    let stateInput = document.getElementById("stateDropDown");
    let stateValue = stateInput.value;
    return stateValue
}

function writeAlerts(response) {
    let weatherAlerts = document.getElementById("Weather-alerts");
    let alertHeader = document.createElement("h2");
    let alertHeaderText = document.createTextNode("Weather Alerts");
    alertHeader.appendChild(alertHeaderText);
    weatherAlerts.appendChild(alertHeader);
    if (response.alerts != undefined) {
        response.alerts.forEach(element => {
            let alertLocation = document.createElement("p");
            let alertLocationText = document.createTextNode(element.sender_name);
            alertLocation.appendChild(alertLocationText);
            weatherAlerts.appendChild(alertLocation);

            let alertType = document.createElement("p");
            let alertTypeText = document.createTextNode(element.event);
            alertType.appendChild(alertTypeText);
            weatherAlerts.appendChild(alertType);
        });
    }
    else {
        let noAlert = document.createElement("p");
        let text = document.createTextNode("There are no current weather alerts for this location.");
        noAlert.appendChild(text);
        weatherAlerts.appendChild(noAlert);
    }
}

function displayMainContent(response, activeTab) {
    if(activeTab == "currentTab"){
        displayCurrentContent(response);
    }
    else if(activeTab == "hourlyTab"){
        displayHourlyContent(response);
    }
    else if(activeTab == "dailyTab"){
        displayDailyContent(response);
    }
    else if(activeTab == "radarTab"){
        requestRadarData();
    }
}

function displayCurrentContent(response){
    let contentDiv = document.getElementById("mainContentContainer");
    let currentHeader = document.createElement("h2");
    let headerText = document.createTextNode("Current Conditions");
    currentHeader.appendChild(headerText);

    let currentTemp = document.createElement("p");
    let tempText = document.createTextNode("Temperature: " + ~~getCurrentTemp(response).toString() + " fahrenheit");
    currentTemp.appendChild(tempText);

    let currentWind = document.createElement("p");
    let windSpeedText = document.createTextNode("Wind Speed: " + ~~getCurrentWindSpeed(response).toString() + " mph")
    currentWind.appendChild(windSpeedText);

    let currentWindDirection = document.createElement("p");
    windDegree = getWindDegree(response);
    windDirection = getWindDirection(windDegree);
    let windDirectionText = document.createTextNode(" Wind Direction: " + windDirection);
    currentWindDirection.appendChild(windDirectionText);

    let currentIcon = getCurrentIcon(response);
    let iconImage = document.createElement("img");
    iconImage.src = currentIcon;

    contentDiv.appendChild(currentTemp);
    contentDiv.appendChild(currentWind);
    contentDiv.appendChild(currentWindDirection);
    contentDiv.appendChild(iconImage);
}

function displayError(response) {
    let contentDiv = document.getElementById("mainContentContainer");
    let errorNode = document.createElement("p");
    let errorText = document.createTextNode(response.status + " "  + response.statusText);
    errorNode.appendChild(errorText);
    contentDiv.appendChild(errorNode);
}

function displayHourlyContent(response) {
    let contentDiv = document.getElementById("mainContentContainer");
    let table = document.createElement("table");
    let header = document.createElement("thead");
    let headerRow = document.createElement("tr");

    let headerCell1 = document.createElement("th");
    let headerText1 = document.createTextNode("Time");
    headerCell1.appendChild(headerText1);
    headerRow.appendChild(headerCell1);

    let headerCell2 = document.createElement("th");
    let headerText2 = document.createTextNode("Temperature");
    headerCell2.appendChild(headerText2);
    headerRow.appendChild(headerCell2);

    let headerCell3 = document.createElement("th");
    let headerText3 = document.createTextNode("Wind Speed");
    headerCell3.appendChild(headerText3);
    headerRow.appendChild(headerCell3);

    let headerCell4 = document.createElement("th");
    let headerText4 = document.createTextNode("Wind Direction");
    headerCell4.appendChild(headerText4);
    headerRow.appendChild(headerCell4);

    let headerCell5 = document.createElement("th");
    let headerText5 = document.createTextNode("Rain");
    headerCell5.appendChild(headerText5);
    headerRow.appendChild(headerCell5);

    header.appendChild(headerRow);
    table.appendChild(header);

    let body = document.createElement("tbody");
    for(i = 0; i < 48; i++){
        let newRow = document.createElement("tr");

        let timeCell = document.createElement("td");
        let time = getHourlyTime(i, response);
        let timeText = document.createTextNode(time);
        timeCell.appendChild(timeText);
        newRow.appendChild(timeCell);

        let temperatureCell = document.createElement("td");
        let temperature = getHourlyTemperature(i, response);
        let temperatureText = document.createTextNode(~~temperature.toString());
        temperatureCell.appendChild(temperatureText);
        newRow.appendChild(temperatureCell);

        let windSpeedCell = document.createElement("td");
        let windSpeedText = document.createTextNode(getHourlyWindSpeed(i, response).toString());
        windSpeedCell.appendChild(windSpeedText);
        newRow.appendChild(windSpeedCell);

        let windDirectionCell = document.createElement("td");
        let windDirectionText = document.createTextNode(getHourlyWindDirection(i, response));
        windDirectionCell.appendChild(windDirectionText);
        newRow.appendChild(windDirectionCell);

        let rainCell = document.createElement("td");
        let rainText = document.createTextNode(getHourlyRainfall(i, response));
        rainCell.appendChild(rainText);
        newRow.appendChild(rainCell);

        body.appendChild(newRow);
    }
    table.appendChild(body);
    contentDiv.appendChild(table);
}

function displayDailyContent(response) {
    let contentDiv = document.getElementById("mainContentContainer");
    let table = document.createElement("table");
    let header = document.createElement("thead");
    let headerRow = document.createElement("tr");

    let headerCell1 = document.createElement("th");
    let headerText1 = document.createTextNode("Day");
    headerCell1.appendChild(headerText1);
    headerRow.appendChild(headerCell1);

    let headerCell2 = document.createElement("th");
    let headerText2 = document.createTextNode("Temperature");
    headerCell2.appendChild(headerText2);
    headerRow.appendChild(headerCell2);

    let headerCell3 = document.createElement("th");
    let headerText3 = document.createTextNode("Wind Speed");
    headerCell3.appendChild(headerText3);
    headerRow.appendChild(headerCell3);

    let headerCell4 = document.createElement("th");
    let headerText4 = document.createTextNode("Wind Direction");
    headerCell4.appendChild(headerText4);
    headerRow.appendChild(headerCell4);

    let headerCell5 = document.createElement("th");
    let headerText5 = document.createTextNode("Rain");
    headerCell5.appendChild(headerText5);
    headerRow.appendChild(headerCell5);

    header.appendChild(headerRow);
    table.appendChild(header);

    let body = document.createElement("tbody");
    for(i = 0; i < response.daily.length; i++){
        let newRow = document.createElement("tr");

        let timeCell = document.createElement("td");
        let time = getDate(i, response);
        let timeText = document.createTextNode(time);
        timeCell.appendChild(timeText);
        newRow.appendChild(timeCell);

        let temperatureCell = document.createElement("td");
        let temperature = getDailyTemperature(i, response);
        let temperatureText = document.createTextNode(~~temperature.toString());
        temperatureCell.appendChild(temperatureText);
        newRow.appendChild(temperatureCell);

        let windSpeedCell = document.createElement("td");
        let windSpeedText = document.createTextNode(getDailyWindSpeed(i, response).toString());
        windSpeedCell.appendChild(windSpeedText);
        newRow.appendChild(windSpeedCell);

        let windDirectionCell = document.createElement("td");
        let windDirectionText = document.createTextNode(getDailyWindDirection(i, response));
        windDirectionCell.appendChild(windDirectionText);
        newRow.appendChild(windDirectionCell);

        let rainCell = document.createElement("td");
        let rainText = document.createTextNode(getDailyRainfall(i, response));
        rainCell.appendChild(rainText);
        newRow.appendChild(rainCell);

        body.appendChild(newRow);
    }
    table.appendChild(body);
    contentDiv.appendChild(table);
}

function displayImageContent(url) {
    let cityValue = getCityFormData();
    let stateValue = getStateFormData();
    let imageDiv = document.getElementById("locationImage");
    let imageHeader = document.createElement('h2');
    let imageHeaderText = document.createTextNode(cityValue + ', ' + stateValue);
    imageHeader.appendChild(imageHeaderText);
    let cityImage = document.createElement('img'); 
    cityImage.src = url;
    imageDiv.appendChild(imageHeader);
    imageDiv.appendChild(cityImage);
}

function getActiveTab() {
    let tabs = document.getElementsByClassName("content-tab");
    for (let i = 0; i < tabs.length; i++) {
        tab = tabs[i];
        if (tab.classList.contains('active')) {
            return tab.id;
        }
    }
}

function parseDMS(input) {
    let parts = input.split(/[^\d\w]+/);
    return ConvertDMSToDD(parts)
}

function ConvertDMSToDD(parts) {
    let dd = 0;
    for(let i = 0; i < parts.length - 1; i++) {
        dd += parseInt(parts[i])/(60**i);
    }
    let direction = parts.pop();
    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    console.log(dd);
    return dd;
}

function convertLatitude(latitude) {
    console.log("unconverted lat: " + latitude);
    return parseDMS(latitude);
}

function convertLongitude(longitude) {
    return parseDMS(longitude);
}

function getCurrentIcon(response) {
    iconURL = 'http://openweathermap.org/img/wn/' + response.current.weather[0].icon + '@2x.png'
    return iconURL
}

function getCurrentTemp(response) {
    tempFahrenheit = convertTemp(response.current.temp);
    return tempFahrenheit;
}

function getCurrentWindSpeed(response) {
    windSpeed = response.current.wind_speed;
    return windSpeed;
}

function getWindDegree(response) {
    windDegree = response.current.wind_deg;
    return windDegree;
}

function contentTabClicked(e) {
    if(this.classList.contains('active')) {
        return;
    } else {
        currentActive.classList.remove('active');
        currentActive = this;
        currentActive.classList.add('active');
        clearMainContent();
        displayMainContent(api_response, getActiveTab());
    }
}

function clearMainContent() {
    document.getElementById("mainContentContainer").innerHTML = "";
}

function clearWeatherAlerts() {
    document.getElementById("Weather-alerts").innerHTML = "";
}

function clearImage() {
    document.getElementById("locationImage").innerHTML = "";
}

function clearAllContent() {
    clearMainContent();
    clearWeatherAlerts();
    clearImage();
}

function getDailyRainfall(day, response) {
    return response.daily[day].weather[0].description.toProperCase();
}

function getHourlyRainfall(hour, response) {
    return response.hourly[hour].weather[0].description.toProperCase();
}

function getHourlyTime(hour, response) {
    let unixTime = response.hourly[hour].dt;
    return convertTime(unixTime);
}

function getDate(day, response) {
    let unixTime =response.daily[day].dt;
    return convertDay(unixTime);    
}

function getDailyTemperature(day, response) {
    let kelvinTemp = response.daily[day].temp.day;
    let tempF = convertTemp(kelvinTemp);
    return tempF;
}

function getHourlyTemperature(hour, response) {
    let kelvinTemp = response.hourly[hour].temp;
    let tempF = convertTemp(kelvinTemp);
    return tempF;
}

function getDailyWindSpeed(day, response) {
    let windSpeed = response.daily[day].wind_speed;
    return windSpeed;
}

function getHourlyWindSpeed(hour, response) {
    let windSpeed = response.hourly[hour].wind_speed;
    return windSpeed;
}

function getDailyWindDirection(day, response) {
    let windDirection = response.daily[day].wind_deg;
    return getWindDirection(windDegree);
}

function getHourlyWindDirection(hour, response) {
    let windDegree = response.hourly[hour].wind_deg;
    return getWindDirection(windDegree);
}

function convertTemp(kelvinTemp) {
    return 1.8*(kelvinTemp - 273) + 32;
}

function convertTime(unixTime) {
    let date = new Date(unixTime * 1000);
    let hours = date.getHours();
    let month = convertMonth(date.getMonth());
    let day = date.getDate();
    let formattedTime = month + " " + day.toString() + ", "  + hours.toString() + ":00";
    return formattedTime;
}

function convertDay(unixTime) {
    let date = new Date(unixTime * 1000);
    let month = convertMonth(date.getMonth());
    let day = date.getDate();
    let formattedTime = month + " " + day.toString();
    return formattedTime;
}

function convertMonth(month) {
    months = ["January", "February", "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December"];
    return months[month];
}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};