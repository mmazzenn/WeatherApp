"use strict";

// Remove Active Class

let navLinks = document.querySelectorAll(".navbar-nav .nav-link");

navLinks.forEach(function (link) {
  link.addEventListener("click", () => {
    navLinks.forEach(function (link) {
      link.classList.remove("active");
    });
    link.classList.add("active");
  });
});

// Stop Form

document.forms[0].addEventListener("click", (e) => e.preventDefault());
document.forms[1].addEventListener("click", (e) => e.preventDefault());

// Date Operations

function updateClock() {
  let hours = document.getElementById("hours"),
    minutes = document.getElementById("minutes"),
    seconds = document.getElementById("seconds"),
    zone = document.getElementById("zone"),
    dateHours = new Date().getHours(),
    dateMinutes = new Date().getMinutes(),
    dateSeconds = new Date().getSeconds(),
    dateZone = "AM";
  chnageMode("light");
  if (dateHours > 12) {
    dateHours = dateHours - 12;
    dateZone = "PM";
    chnageMode("dark");
  }
  dateHours = dateHours < 10 ? "0" + dateHours : dateHours;
  dateMinutes = dateMinutes < 10 ? "0" + dateMinutes : dateMinutes;
  dateSeconds = dateSeconds < 10 ? "0" + dateSeconds : dateSeconds;
  hours.textContent = dateHours;
  minutes.textContent = dateMinutes;
  seconds.textContent = dateSeconds;
  zone.textContent = dateZone;
}

setInterval(updateClock);

// Morning And Night Mode

function chnageMode(mode) {
  let timeIcon = document.getElementById("timeIcon"),
    iconImgs = document.querySelectorAll("#timeIcon img"),
    lightHome = document.querySelector(".light"),
    darkHome = document.querySelector(".dark"),
    lightVideo = document.getElementById("lightVideo"),
    nightVideo = document.getElementById("nightVideo");
  if (mode === "light") {
    timeIcon.classList.add("rotate");
    iconImgs[0].classList.remove("op-0");
    iconImgs[1].classList.add("op-0");
    darkHome.classList.add("op-0");
    lightHome.classList.remove("op-0");
    nightVideo.classList.add("op-0");
    lightVideo.classList.remove("op-0");
  } else if (mode === "dark") {
    timeIcon.classList.add("scale");
    iconImgs[0].classList.add("op-0");
    iconImgs[1].classList.remove("op-0");
    lightHome.classList.add("op-0");
    darkHome.classList.remove("op-0");
    nightVideo.classList.remove("op-0");
    lightVideo.classList.add("op-0");
  }
}

// Get User Location

let body = document.body;
let stopBox = document.querySelector(".stop");
let locationBox = document.querySelector(".location-box");
let refuseLocation = document.getElementById("refuseLocation");
let acceptLocation = document.getElementById("acceptLocation");
let homeCountry = document.getElementById("homeCountry");

function findMe() {
  let success = (position) => {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    sessionStorage.setItem(
      "userCoordinates",
      JSON.stringify({ latitude, longitude })
    );

    getCityName(latitude, longitude);
  };
  let error = () => {
    body.classList.add("stop-body");
    stopBox.classList.add("show-stop");
    locationBox.classList.add("show-location");
  };

  navigator.geolocation.getCurrentPosition(success, error);
}

findMe();

let storedCoordinates = sessionStorage.getItem("userCoordinates");

if (storedCoordinates) {
  let parsedCoordinates = JSON.parse(storedCoordinates);
  let latitude = parsedCoordinates.latitude;
  let longitude = parsedCoordinates.longitude;

  getCityName(latitude, longitude);
} else {
  body.classList.add("stop-body");
  stopBox.classList.add("show-stop");
  locationBox.classList.add("show-location");
}

refuseLocation.addEventListener("click", () => {
  body.classList.remove("stop-body");
  stopBox.classList.remove("show-stop");
  locationBox.classList.remove("show-location");
});

acceptLocation.addEventListener("click", () => {
  body.classList.remove("stop-body");
  stopBox.classList.remove("show-stop");
  locationBox.classList.remove("show-location");
  findMe();
});

async function getCityName(latitude, longitude) {
  let geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=4ca6d111075d4f3baf96605ac6a8a96b`;
  let req = await fetch(geocodingApiUrl);
  let res = await req.json();
  homeCountry.innerHTML = `${res.results[0].components.city} / ${res.results[0].components.country}`;
  sendReq(res.results[0].components.city);
}

// Start Weather App

let locationInput = document.getElementById("search");
let searchBtn = document.getElementById("searchBtn");

let days = document.querySelectorAll(".day");
let dateMonth = document.querySelector(".date");

let city = document.querySelector(".city");
let continentCountry = document.querySelector(".continent-country");

let conditionIcons = document.querySelectorAll(".iconImg");

let conditionStatus = document.querySelectorAll(".status");

let tempDegree = document.querySelectorAll(".temp-degree");
let windDegree = document.querySelectorAll(".wind-degree");
let windDirection = document.querySelectorAll(".wind-desc");
let humidityDegree = document.querySelectorAll(".humidity-degree");
let uvDegree = document.querySelectorAll(".uv-degree");
let visibilityDegree = document.querySelectorAll(".visibility-degree");
let pressureDegree = document.querySelectorAll(".pressure-degree");

// Search Input

let regex = /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/gi;

locationInput.addEventListener("input", () => {
  let inputVal = locationInput.value;
  if (regex.test(inputVal) && inputVal !== "") {
    sendReq(inputVal);
  }
});

searchBtn.addEventListener("click", () => {
  let inputVal = locationInput.value;
  if (regex.test(inputVal) && inputVal !== "") {
    sendReq(inputVal);
  }
});

async function sendReq(location) {
  let req = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=3e53a264b9dd44d09b9194123232312&q=${location}&days=3`
  );
  let resData = await req.json();
  if (req.status === 200) {
    weatherApi(resData);
  }
}

function weatherApi(resData) {
  function dayOrNight() {
    let dOrN = [];
    let timeNow = new Date().getHours();
    dOrN.push(resData.current.is_day);
    for (let i = 1; i < 3; i++) {
      dOrN.push(resData.forecast.forecastday[i].hour[timeNow].is_day);
    }
    return dOrN;
  }

  function getDate() {
    let dateArr = [];
    for (let i = 0; i < 3; i++) {
      dateArr.push(resData.forecast.forecastday[i].date);
    }
    setDate(dateArr);
  }

  setLocation(
    resData.location.name,
    resData.location.region,
    resData.location.country,
    resData.location.tz_id
  );

  function getWeatherStatus() {
    let weatherStatus = [];
    weatherStatus.push(resData.current.condition.text);
    for (let i = 1; i < 3; i++) {
      weatherStatus.push(resData.forecast.forecastday[i].day.condition.text);
    }
    setWeatherStatus(weatherStatus);
    setBackground(weatherStatus, dayOrNight());
  }

  function getWeatherIcons() {
    let weatherIcons = [];
    weatherIcons.push(resData.current.condition.icon);
    for (let i = 1; i < 3; i++) {
      weatherIcons.push(resData.forecast.forecastday[i].day.condition.icon);
    }
    setWeatherIcons(weatherIcons);
  }

  function getTemp() {
    let maxTemp = [];
    let minTemp = [];
    maxTemp.push(resData.current.feelslike_c);
    for (let i = 1; i < 3; i++) {
      maxTemp.push(resData.forecast.forecastday[i].day.maxtemp_c);
      minTemp.push(resData.forecast.forecastday[i].day.mintemp_c);
    }
    setTemp(maxTemp, minTemp);
  }

  function getWind() {
    let windDir = [];
    let windSpeed = [];
    let timeNow = new Date().getHours();
    windDir.push(resData.current.wind_dir);
    windSpeed.push(resData.current.wind_kph);
    for (let i = 1; i < 3; i++) {
      windDir.push(resData.forecast.forecastday[i].hour[timeNow].wind_dir);
      windSpeed.push(resData.forecast.forecastday[i].day.maxwind_kph);
    }
    setWind(windDir, windSpeed);
  }

  function getHumidity() {
    let humidityVals = [];
    humidityVals.push(resData.current.humidity);
    for (let i = 1; i < 3; i++) {
      humidityVals.push(resData.forecast.forecastday[i].day.avghumidity);
    }
    setHumidity(humidityVals);
  }

  function getUv() {
    let uvVals = [];
    uvVals.push(resData.current.uv);
    for (let i = 1; i < 3; i++) {
      uvVals.push(resData.forecast.forecastday[i].day.uv);
    }
    setUv(uvVals);
  }

  function getVisibility() {
    let visibilityVals = [];
    visibilityVals.push(resData.current.vis_km);
    for (let i = 1; i < 3; i++) {
      visibilityVals.push(resData.forecast.forecastday[i].day.avgvis_km);
    }
    setVisibility(visibilityVals);
  }

  function getPressure() {
    let pressureVals = [];
    let timeNow = new Date().getHours();
    pressureVals.push(resData.current.pressure_mb);
    for (let i = 1; i < 3; i++) {
      pressureVals.push(
        resData.forecast.forecastday[i].hour[timeNow].pressure_mb
      );
    }
    setPressure(pressureVals);
  }

  getDate();
  getWeatherStatus();
  getWeatherIcons();
  getTemp();
  getWind();
  getHumidity();
  getUv();
  getVisibility();
  getPressure();

  console.log(resData);
}

// Edit Data At Page

function setDate(date) {
  for (let i = 0; i < date.length; i++) {
    let dayName = new Date(date[i]).toLocaleDateString("en-us", {
      weekday: "long",
    });
    days[i].innerHTML = dayName;
  }
  let day = new Date(date[0]).getDate();
  let monthName = new Date(date[0]).toLocaleString("default", {
    month: "long",
  });

  dateMonth.innerHTML = `${day} ${monthName}`;
}

function setLocation(name, region, country, continentCity) {
  city.innerHTML = `${name} / ${region}`;
  continentCountry.innerHTML = `${country} / ${continentCity.substring(
    0,
    continentCity.indexOf("/")
  )}`;
}

function setWeatherStatus(status) {
  for (let i = 0; i < conditionStatus.length; i++) {
    conditionStatus[i].innerHTML = status[i];
  }
}

function setWeatherIcons(icons) {
  for (let i = 0; i < conditionIcons.length; i++) {
    conditionIcons[
      i
    ].innerHTML = `<img src="https://${icons[i]}" class="w-100" />`;
  }
}

function setTemp(max, min) {
  for (let i = 0; i < tempDegree.length; i++) {
    i === 0
      ? (tempDegree[
          i
        ].innerHTML = `<p class="d-inline-block">${max[i]}</p><span>C</span>`)
      : (tempDegree[
          i
        ].innerHTML = `<p class="d-inline-block">Max: ${max[i]}</p><span>C</span>`);
    tempDegree[i].classList.add("show-temp");
  }

  for (let i = 0; i < min.length; i++) {
    let j = i + 1;
    tempDegree[
      j
    ].innerHTML += `<br/><p class="d-inline-block">Min: ${min[i]}</p><span>C</span>`;
    j++;
  }
}

function setWind(dir, speed) {
  for (let i = 0; i < windDirection.length; i++) {
    windDirection[i].innerHTML = `${dir[i]} `;
  }

  for (let i = 0; i < windDegree.length; i++) {
    windDegree[i].innerHTML = `${speed[i]} km/h`;
  }
}

function setHumidity(humidityVals) {
  for (let i = 0; i < humidityDegree.length; i++) {
    humidityDegree[i].innerHTML = `${humidityVals[i]}%`;
  }
}

function setUv(uvVals) {
  for (let i = 0; i < uvDegree.length; i++) {
    uvDegree[i].innerHTML = uvVals[i];
  }
}

function setVisibility(visibilityVals) {
  for (let i = 0; i < visibilityDegree.length; i++) {
    visibilityDegree[i].innerHTML = `${visibilityVals[i]} Km`;
  }
}

function setPressure(pressureVals) {
  for (let i = 0; i < pressureDegree.length; i++) {
    pressureDegree[i].innerHTML = `${pressureVals[i]} mb`;
  }
}

function setBackground(weatherConditions, dayOrNight) {
  let box = Array.from(document.querySelectorAll(".box"));
  for (let i = 0; i < dayOrNight.length; i++) {
    if (dayOrNight[i] === 0) {
      box[
        i
      ].style.cssText = `background-image: url('./assets/weather/day/${weatherConditions[i]}.jpg')`;
    } else if (dayOrNight[i] === 1) {
      box[
        i
      ].style.cssText = `background-image: url('./assets/weather/night/${weatherConditions[i]}.jpg')`;
    }
  }
  console.log(dayOrNight);
  console.log(weatherConditions);
}

// [0, 0, 0][("Partly cloudy", "Partly cloudy", "Partly cloudy")];
