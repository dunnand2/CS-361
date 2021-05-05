const currentTemp = document.getElementById("Temp");
const currentWind = document.getElementById("Wind");
const currentWindDirection = document.getElementById("WindDirection");
const searchButton = document.getElementById("Search");

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


    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=41.85&lon=-87.65&appid=26725991df4a07c7462c67cf12165745', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        tempFahrenheit = 1.8*(response.current.temp - 273) + 32;
        windSpeed = response.current.wind_speed
        windDegree = response.current.wind_deg
        windDirection = getWindDirection(windDegree);
        console.log(windDirection);
        currentTemp.textContent += ~~tempFahrenheit.toString() + " fahrenheit";
        currentWind.textContent += ~~windSpeed.toString() + "mph";
        currentWindDirection.textContent += windDirection;
        console.log(response)
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