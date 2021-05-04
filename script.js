const currentTemp = document.getElementById("Temp");
const currentWind = document.getElementById("Wind");
const searchButton = document.getElementById("Search");

searchButton.addEventListener("click", function(){
    let input = document.getElementById("searchForm");
    let value = input.value;
    console.log(value)
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + value + '&appid=26725991df4a07c7462c67cf12165745', {mode: 'cors'})
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        temp_fahrenheit = 1.8*(response.main.temp - 273) + 32;
        wind_speed = response.wind.speed
        currentTemp.textContent += ~~temp_fahrenheit.toString() + " fahrenheit";
        currentWind.textContent += ~~wind_speed.toString() + "mph";
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
