
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const createWeatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const loadingSpinner = document.querySelector(".loading-spinner");
const tempButtons = document.querySelectorAll(".temp-btn");

const API_KEY = 'cb36dedad8508d6fc3034dae7611cf53';
let tempUnit = 'C';

const kelvinToCelsius = (temp) => (temp - 273.15).toFixed(2);
const kelvinToFahrenheit = (temp) => ((temp - 273.15) * 9/5 + 32).toFixed(2);

const getTemp = (temp) => {
    return tempUnit === 'C' ? `${kelvinToCelsius(temp)}°C` : `${kelvinToFahrenheit(temp)}°F`;
}

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${getTemp(weatherItem.main.temp)}</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temperature: ${getTemp(weatherItem.main.temp)}</h4>
                    <h4>Wind: ${weatherItem.wind.speed} m/s</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    loadingSpinner.style.display = "block";
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear previous input and weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            createWeatherCardsDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    createWeatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
            loadingSpinner.style.display = "none";
        })
        .catch(() => {
            alert("An error has occurred when fetching forecast data");
            loadingSpinner.style.display = "none";
        });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${API_KEY}`;
    loadingSpinner.style.display = "block";
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) {
                loadingSpinner.style.display = "none";
                return alert(`No coordinates found for ${cityName}`);
            }
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error has occurred when fetching the coordinates");
            loadingSpinner.style.display = "none";
        });
}

searchButton.addEventListener("click", getCityCoordinates);

tempButtons.forEach(button => {
    button.addEventListener("click", () => {
        tempUnit = button.getAttribute("data-unit");
        const cityName = cityInput.value.trim();
        if (cityName) {
            getCityCoordinates();
        }
    });
});
