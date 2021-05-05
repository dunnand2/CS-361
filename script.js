const currentTemp = document.getElementById("Temp");
const currentWind = document.getElementById("Wind");
const searchButton = document.getElementById("Search");

searchButton.addEventListener("click", function(){
    let cityInput = document.getElementById("searchForm");
    let cityValue = cityInput.value;
    let stateInput = document.getElementById("stateDropDown");
    let stateValue = stateInput.value
    let xhr = new XMLHttpRequest();
    let payload = JSON.stringify({
        searchType: "City",
        city: cityValue,
        state: stateValue
    })
    const url = 'http://127.0.0.1:3000/';
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(payload);


    /*fetch('https://api.openweathermap.org/data/2.5/weather?q=' + value + '&appid=26725991df4a07c7462c67cf12165745', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        temp_fahrenheit = 1.8*(response.main.temp - 273) + 32;
        wind_speed = response.wind.speed
        currentTemp.textContent += ~~temp_fahrenheit.toString() + " fahrenheit";
        currentWind.textContent += ~~wind_speed.toString() + "mph";
        console.log(response)
    })*/
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

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }
  
