const contentDiv = getMainContentContainer();
const requestHeaders = {'Accept': 'application/json', 'Content-Type': 'application/json'};
const searchButton = document.getElementById("Search");
const currentTab = document.getElementById("currentTab");
const hourlyTab = document.getElementById("hourlyTab");
const dailyTab = document.getElementById("dailyTab");
const radarTab = document.getElementById("radarTab");
const weatherAlerts = document.getElementById("weatherAlerts");
let currentActive = currentTab;
let api_response = null;
let current_lat = null;
let current_long = null;
let systemOfUnits = 'imperial';
let temperatureUnits;
let windSpeedUnits;
let map;


addEventListeners();

function addEventListeners() {
    searchButton.addEventListener("click", searchButtonClicked);
    currentTab.addEventListener("click", contentTabClicked);
    hourlyTab.addEventListener("click", contentTabClicked);
    dailyTab.addEventListener("click", contentTabClicked);
    radarTab.addEventListener("click", contentTabClicked);
}

async function searchButtonClicked() {
    clearAllContent();
    let payload = createPayload();
    let serverURL = getServerURL();
    let response = await fetch(serverURL, {method: 'POST', headers: requestHeaders, body: payload, mode: 'cors'});
    if (!response.ok) {
        displayError(response);
        return
    }
    let body = await response.json();
    updateSystemOfUnits();
    let weatherData = await getWeatherData(body);
    let untransformedURL = getUntransformedURL(body);
    let transformedURL = await transformFromURL(untransformedURL);
    displayAllContent(weatherData, transformedURL);
}

function displayAllContent(weatherData, transformedURL) {
    displayWeatherAlerts(weatherData);
    displayMainContent(weatherData, getActiveTab());
    displayImageContent(transformedURL);
}

async function getWeatherData(scrapedResponse) {
    // get lat and longitude from wikipedia HTML
    current_lat = convertLatitude(scrapedResponse.lat);
    current_long = convertLongitude(scrapedResponse.long);
    let openWeatherRequestURL = createOpenWeatherURL();
    let weatherResponse = await fetch(openWeatherRequestURL, {mode: 'cors'});
    let weatherData = await weatherResponse.json()
    saveWeatherData(weatherData);
    return weatherData
}

function createRadarData() {
    clearMainContent();
    mapboxgl.accessToken = 'pk.eyJ1IjoiZHVubmFuZCIsImEiOiJja29zdGs5NGgwNDd3MzFvMTNiZGphMHhvIn0.ehUkvT41JA7bSKJVHKfVqA';
    map = new mapboxgl.Map({
        container: 'mainContentContainer',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 4,
        center: [current_long, current_lat]
    });
    
    map.on('load', function(){
        addMapRadarLayer(map, "precipitation_new");
    });

    addRadarRadioBox();
}

function addMapRadarLayer(map, layerType) {
    map.addLayer({
        "id": "simple-tiles",
        "type": "raster",
        "source": {
          "type": "raster",
          "tiles": ["https://tile.openweathermap.org/map/" + layerType + "/{z}/{x}/{y}.png?appid=874718354841f0e0250b4b06a05a971e"],
          "tileSize": 256
        },
        "minzoom": 0,
        "maxzoom": 22
      });
}

function addRadarRadioBox() {
    const formDiv = createRadioFormDiv()
    const radioForm = createRadioForm()
    addRadioItems(radioForm);
    formDiv.appendChild(radioForm)
    contentDiv.appendChild(formDiv);
}

function addRadioItems(radiobox) {
    let buttons = ['precipitation', 'temp', 'pressure', 'clouds', 'wind'];
    let labels = ['precipitation', 'temperature', 'pressure', 'clouds', 'wind'];
    
    for(let i = 0; i < buttons.length; i++ ) {
        let input = createRadioButton(buttons[i]);
        let label = createRadioLabel(labels[i]);
        if(i == 0) {
            input.checked = true;
        }
        label.append(input);
        input.addEventListener('change', radarRadioClicked);
        radiobox.appendChild(label);
    }
}

function createRadioForm() {
    const radioForm = document.createElement('form');
    radioForm.id = 'radioForm'
    return radioForm
}

function createRadioFormDiv() {
    const formDiv = document.createElement('div');
    formDiv.id = "radioBoxDiv";
    return formDiv
}

function createRadioButton(buttonType) {
    const input = document.createElement('input');
    input.id = buttonType;
    input.name = 'radar';
    input.value = buttonType + '_new';
    input.type = 'radio'
    return input
}

function createRadioLabel(buttonType) {
    const label = document.createElement('label');
    label.for = buttonType;
    const labelText = document.createTextNode(buttonType.toProperCase())
    label.appendChild(labelText);
    return label
}

function radarRadioClicked(event) {
    let radioBoxValue = event.target.value;
    map.removeLayer('simple-tiles');
    map.removeSource('simple-tiles');
    addMapRadarLayer(map, radioBoxValue);
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
    let myTransformation = 'monochrome';
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

function displayWeatherAlerts(response) {
    createAlertHeader();
    if (response.alerts != undefined) {
        writeAlerts(response.alerts);
    }
    else {
        writeNoAlert();
    }
}

function createAlertHeader(){
    let alertHeader = createDOMElement("h3", "Weather Alerts");
    weatherAlerts.appendChild(alertHeader);
}

function writeAlerts(alerts) {
    alerts.forEach(element => {
        // Create paragraph tag of alert location and append to weather alert div
        let alertLocation = createDOMElement("p", element.sender_name);
        weatherAlerts.appendChild(alertLocation);

        // Create paragraph tag of alert type and append to weather alert div
        let alertType = createDOMElement("p", element.event);
        weatherAlerts.appendChild(alertType);
    });
}

function writeNoAlert() {
    let noAlert = createDOMElement("p", "There are no current weather alerts for this location.");
    weatherAlerts.appendChild(noAlert);
}

function createDOMElement(elementType, text=null) {
    let paragraph = document.createElement(elementType);
    if (text != null) {
        let paragraphText = document.createTextNode(text);
        paragraph.appendChild(paragraphText);
    }
    return paragraph
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
        createRadarData();
    }
}

function displayCurrentContent(response){
    //let currentHeader = createDOMElement("h2", "Current Conditions");
    let currentHeader = document.createElement("h2");
    let headerText = document.createTextNode("Current Conditions");
    currentHeader.appendChild(headerText);

    let currentTemp = document.createElement("p");
    let tempText = document.createTextNode("Temperature: " + ~~getCurrentTemp(response).toString() + " " + temperatureUnits);
    currentTemp.appendChild(tempText);

    let currentWind = document.createElement("p");
    let windSpeedText = document.createTextNode("Wind Speed: " + ~~getCurrentWindSpeed(response).toString() + " " + windSpeedUnits);
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

    // Display hourly weather conditions
    let headerCell5 = document.createElement("th");
    let headerText5 = document.createTextNode("Conditions");
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
    let headerText5 = document.createTextNode("Conditions");
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
    let imageDiv = document.getElementById("locationImageContainer");
    let imageHeader = document.createElement('h3');
    let imageHeaderText = document.createTextNode(cityValue + ', ' + stateValue);
    imageHeader.appendChild(imageHeaderText);
    let cityImage = document.createElement('img'); 
    cityImage.id = 'locationImage';
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
    return dd;
}

function convertLatitude(latitude) {

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
    return response.current.temp
}

function getCurrentWindSpeed(response) {
    windSpeed = response.current.wind_speed;
    return windSpeed;
}

function getTemperatureUnits() {

}

function getUntransformedURL(body) {
    let untransformedURL = "http:" + body.imageURL;
    return untransformedURL
}

function getWindDegree(response) {
    windDegree = response.current.wind_deg;
    return windDegree;
}

function getMainContentContainer() {
    return document.getElementById("mainContentContainer");
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
    contentDiv.innerHTML = "";
}

function clearWeatherAlerts() {
    weatherAlerts.innerHTML = "";
}

function clearImage() {
    document.getElementById("locationImageContainer").innerHTML = "";
}

function clearAllContent() {
    clearMainContent();
    clearWeatherAlerts();
    clearImage();
}

function createOpenWeatherURL(){
    return 'https://api.openweathermap.org/data/2.5/onecall?lat=' + current_lat + '&lon=' + current_long + '&units=' + systemOfUnits + '&appid=26725991df4a07c7462c67cf12165745'
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
    return response.daily[day].temp.day;
}

function getHourlyTemperature(hour, response) {
    return response.hourly[hour].temp;

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

function getServerURL() {
    const serverURL = 'http://127.0.0.1:35351/api';
    //const serverURL = 'http://localhost:35351/api';
    //const serverURL = 'http://flip3.engr.oregonstate.edu:35351/'
    return serverURL
}

function getUnitOfMeasurement() {
    return document.querySelector('input[name="units"]:checked').value
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

function updateSystemOfUnits(){
    systemOfUnits = getUnitOfMeasurement();
    switch (systemOfUnits) {
        case 'imperial':
            temperatureUnits = String.fromCharCode(176) + 'F';
            windSpeedUnits = 'Mph';
            break;
        case 'metric':
            temperatureUnits = String.fromCharCode(176) + 'C';
            windSpeedUnits = 'm/s';
            break;
        case 'standard':
            temperatureUnits = 'K';
            windSpeedUnits = 'm/s';
            break;
    }
}
