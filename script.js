const searchButton = document.getElementById("Search");
const currentTab = document.getElementById("currentTab");
const hourlyTab = document.getElementById("hourlyTab");
const dailyTab = document.getElementById("dailyTab");
const testButton = document.getElementById("Test");

currentTab.addEventListener("click", contentTabClicked);
hourlyTab.addEventListener("click", contentTabClicked);
dailyTab.addEventListener("click", contentTabClicked);

let currentActive = currentTab;
let api_response = null;

searchButton.addEventListener("click", searchButtonClicked);

function addEventListeners() {

}

async function searchButtonClicked() {
    clearAllContent();
    let cityValue = getCityFormData();
    let stateValue = getStateFormData();
    let payload = JSON.stringify({
        searchType: "City",
        city: cityValue,
        state: stateValue
    })
    //const serverURL = 'http://127.0.0.1:35351/';
    const serverURL = 'http://flip3.engr.oregonstate.edu:35351/'
    let response = await fetch(serverURL, {method: 'POST', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}, body: payload, mode: 'cors'});
    let body =  await response.json();
    let weatherData = await getWeatherData(body);
    let untransformedURL = "http:" + body.imageURL;
    let transformedURL = await transformFromURL(untransformedURL);
    saveWeatherData(weatherData);
    displayMainContent(weatherData, getActiveTab());
    writeAlerts(weatherData);
    displayImageContent(transformedURL);
}

async function getWeatherData(scrapedResponse) {
    let lat = convertLatitude(scrapedResponse.lat);
    let long = convertLongitude(scrapedResponse.long);
    let weatherResponse = await fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + long + '&appid=26725991df4a07c7462c67cf12165745', {mode: 'cors'});
    return weatherResponse.json();
}

function saveWeatherData(response) {
    api_response = response;
}

testButton.addEventListener("click", transformFromURL);

async function transformFromURL(untransformedURL){
    const uri = 'http://flip2.engr.oregonstate.edu:59835/api/services/imageTransformer';
    const body = new FormData();
    let myTransformation = 'saturate';
    body.append('img', untransformedURL);
    body.append('transformation', myTransformation ?? '');
    const req = await fetch(uri, {method: 'POST', body: body, mode: 'cors'});
    if (!req.ok) {
        throw new Error(`HTTP error! status: ${req.status}`);
      }
    const response = await req.json();
    return response.imgUrl; 
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

    contentDiv.appendChild(currentTemp);
    contentDiv.appendChild(currentWind);
    contentDiv.appendChild(currentWindDirection);
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
    console.log(url);
    let imageDiv = document.getElementById("locationImage");
    let cityImage = document.createElement('img'); 
    cityImage.src = url;
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

function convertLatitude(latitude) {
    let new_latitude = "";
    if(latitude[latitude.length - 1] == "S") {
        new_latitude += "-";
    }
    for(let i = 0; i < latitude.length; i++) {
        if (latitude[i] == "°") {
            new_latitude += '.';
        } else if (latitude[i] == '′') {
            return new_latitude
        } else {
            new_latitude += latitude[i]
        }
    }
    return new_latitude;
}

function convertLongitude(longitude) {
    let new_longitude = "";
    if(longitude[longitude.length - 1] == "W") {
        new_longitude += "-";
    }
    for(let i = 0; i < longitude.length; i++) {
        if (longitude[i] == "°") {
            new_longitude += '.';
        } else if (longitude[i] == '′') {
            return new_longitude
        } else {
            new_longitude += longitude[i]
        }
    }
    return new_latitude;
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
        if(api_response != null) {
            displayMainContent(api_response, getActiveTab());
        }   
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