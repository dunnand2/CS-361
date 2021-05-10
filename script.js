const currentTemp = document.getElementById("Temp");
const currentWind = document.getElementById("Wind");
const currentWindDirection = document.getElementById("WindDirection");
const searchButton = document.getElementById("Search");
const currentTab = document.getElementById("currentTab");
const hourlyTab = document.getElementById("hourlyTab");
const dailyTab = document.getElementById("dailyTab");

currentTab.addEventListener("click", contentTabClicked);
hourlyTab.addEventListener("click", contentTabClicked);
dailyTab.addEventListener("click", contentTabClicked);

let currentActive = currentTab;
let api_response = null;

searchButton.addEventListener("click", function(){
    let cityInput = document.getElementById("searchForm");
    let cityValue = cityInput.value;
    let stateInput = document.getElementById("stateDropDown");
    let stateValue = stateInput.value;
    /*let xhr = new XMLHttpRequest();
    let payload = JSON.stringify({
        searchType: "City",
        city: cityValue,
        state: stateValue
    })
    const url = 'http://127.0.0.1:3000/';
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);*/


    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=35.07&lon=-89.58&appid=26725991df4a07c7462c67cf12165745', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        api_response = response; 
        let activeTab = getActiveTab();
        displayMainContent(response, activeTab);
        console.log(response);
        writeAlerts(response);
    })
});    
/*fetch('https://api.openweathermap.org/data/2.5/weather?q=Chicago&appid=26725991df4a07c7462c67cf12165745', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        temp_fahrenheit = 1.8*(response.main.temp - 273) + 32;
        wind_speed = response.wind.speed
        currentTemp.textContent += ~~temp_fahrenheit.toString() + " fahrenheit";
        currentWind.textContent += ~~wind_speed.toString() + "mph";
        console.log(response)
});*/ 

function getWindDirection(degree){
    if (degree >= 337.5 && degree < 22.5){
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

function writeAlerts(response) {
    let weatherAlerts = document.getElementById("Weather-alerts");
    if (response.alerts != undefined) {
        response.alerts.forEach(element => {
            let alertLocation = document.createElement("p");
            let text = document.createTextNode(element.sender_name);
            alertLocation.appendChild(text);
            weatherAlerts.appendChild(alertLocation);

            let alertType = document.createElement("p");
            text = document.createTextNode(element.event);
            alertType.appendChild(text);
            weatherAlerts.appendChild(alertLocation);
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
        return;
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
    contentDiv.appendChild(table);
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

function getCurrentTemp(response) {
    tempFahrenheit = 1.8*(response.current.temp - 273) + 32;
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