import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './style.module.css';
import { Header } from '../search/Header/Header.jsx';

import thunderImage from '../../assets/thunder.png';
import drizzleImage from '../../assets/drizzle.png';
import snowImage from '../../assets/snow.png';
import rainImage from '../../assets/rain.png';
import clearImage from '../../assets/sunny.png';
import cloudsImage from '../../assets/clouds.png';
import sunnyImage from '../../assets/sunny.png';
import nightImage from '../../assets/night.png';
import windImage from '../../assets/wind.png';
import mistImage from '../../assets/mist.png';
import squallImage from '../../assets/squall.png';
import humidityImage from '../../assets/humidity.png';
import pressureImage from '../../assets/pressure.png';
import visibilityImage from '../../assets/visibility.png';
import windSpeedImage from '../../assets/windSpeed.png';

const weatherImages = {
  Thunder: thunderImage,
  Drizzle: drizzleImage,
  Snow: snowImage,
  Rain: rainImage,
  Clear: clearImage,
  Clouds: cloudsImage,
  Sunny: sunnyImage,
  Night: nightImage,
  Wind: windImage,
  Mist: mistImage,
  Squalls: squallImage,
};

const getWeatherImage = (condition, isDaytime) => {
  if (condition.includes('thunderstorm')) return weatherImages.Thunder;
  if (condition.includes('drizzle')) return weatherImages.Drizzle;
  if (condition.includes('snow')) return weatherImages.Snow;
  if (condition.includes('rain')) return weatherImages.Rain;
  if (condition.includes('clear') && isDaytime) return weatherImages.Sunny;
  if (condition.includes('clear') && !isDaytime) return weatherImages.Night;
  if (condition.includes('clouds')) return weatherImages.Clouds;
  if (condition.includes('wind')) return weatherImages.Wind;
  if (condition.includes('mist')) return weatherImages.Mist;
  if (condition.includes('squalls')) return weatherImages.Squalls;
  if (condition.includes('smoke')) return weatherImages.Mist;
  if (condition.includes('haze')) return weatherImages.Squalls;

  return weatherImages.Clear; 
};

const countryNameMap = {
  "US": "United States",
  "GB": "United Kingdom",
  "PL": "Poland",
  "BY": "Belarus",
  "RU": "Russia",
  "UA": "Ukraine",
};

const getCountryName = (code) => countryNameMap[code] || code;

const convertWindSpeed = (speed, unit) => {
  if (unit === 'imperial') {
    return (speed * 2.237).toFixed(1);
  }
  return (speed * 3.6).toFixed(1);
};

const convertVisibility = (visibility, unit) => {
  if (unit === 'imperial') {
    return (visibility / 1.609).toFixed(1);
  }
  return visibility.toFixed(1);
};

const fetchSunriseSunset = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching sunrise and sunset data", error);
    return null;
  }
};

const isDayTime = (currentTime, sunrise, sunset) => {
  return currentTime >= new Date(sunrise) && currentTime < new Date(sunset);
};

export const City = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { name: cityName } = location.state || {};
  const [weatherData, setWeatherData] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/city', { state: { name: searchTerm } });
  };

  const fetchWeatherData = async (city, unit) => {
    setLoading(true);
    setError(null);
    try {
      const { data: weatherResponse } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: { q: city, appid: '862c32def63cd7ea7adc6141145f0781', units: unit }
      });

      const { coord: { lon, lat }, name: cityName, sys: { country: countryCode }, timezone } = weatherResponse;
      const countryName = getCountryName(countryCode);

      const { data: regionResponse } = await axios.get('https://api.openweathermap.org/geo/1.0/reverse', {
        params: { lat: lat.toString(), lon: lon.toString(), appid: '862c32def63cd7ea7adc6141145f0781', limit: 1 }
      });

      const region = regionResponse[0]?.state || '';

      const { data: oneCallResponse } = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: { lat, lon, appid: '862c32def63cd7ea7adc6141145f0781', units: unit }
      });

      const sunriseSunsetData = await fetchSunriseSunset(lat, lon);

      if (!sunriseSunsetData) {
        setError('Failed to fetch sunrise and sunset data.');
        setLoading(false);
        return;
      }

      const { sunrise, sunset } = sunriseSunsetData;

      const forecastData = oneCallResponse.list;
      const forecast = [];

      let lastMorningTemp = 'N/A';
      let lastMiddayTemp = 'N/A';
      let lastEveningTemp = 'N/A';

      forecastData.forEach(entry => {
        const entryDate = new Date(entry.dt * 1000);
        const localTime = new Date(entryDate.getTime() + (timezone * 1000)); // Adjust for timezone offset
        const date = localTime.toISOString().split('T')[0];
        const hour = localTime.getUTCHours();

        let dayEntry = forecast.find(f => f.date === date);
        if (!dayEntry) {
          dayEntry = { date, morningTemp: null, middayTemp: null, eveningTemp: null, condition: entry.weather[0].description };
          forecast.push(dayEntry);
        }

        if (hour >= 6 && hour < 12) {
          dayEntry.morningTemp = Math.round(entry.main.temp);
          lastMorningTemp = dayEntry.morningTemp;
        } else if (hour >= 12 && hour < 18) {
          dayEntry.middayTemp = Math.round(entry.main.temp);
          lastMiddayTemp = dayEntry.middayTemp;
        } else if (hour >= 18 && hour <= 21) {
          dayEntry.eveningTemp = Math.round(entry.main.temp);
          lastEveningTemp = dayEntry.eveningTemp;
        }
      });

      forecast.forEach(day => {
        if (day.morningTemp === null) day.morningTemp = lastMorningTemp;
        if (day.middayTemp === null) day.middayTemp = lastMiddayTemp;
        if (day.eveningTemp === null) day.eveningTemp = lastEveningTemp;
      });

      const currentTime = new Date();
      const isDaytime = isDayTime(currentTime, sunrise, sunset);

      setWeatherData({
        name: cityName,
        country: countryName,
        region: region || null, // Explicitly set to null if empty
        temperature: Math.round(weatherResponse.main.temp),
        condition: weatherResponse.weather[0].description,
        humidity: weatherResponse.main.humidity,
        pressure: Math.round(weatherResponse.main.pressure * 0.75),
        visibility: convertVisibility(weatherResponse.visibility / 1000, unit),
        feelsLike: Math.round(weatherResponse.main.feels_like),
        windSpeed: convertWindSpeed(weatherResponse.wind.speed, unit),
        sunrise: new Date(sunrise).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        sunset: new Date(sunset).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        unit: unit === 'metric' ? '℃' : '℉',
        visibilityUnit: unit === 'metric' ? 'km' : 'mi',
        forecast: forecast.slice(0, 5),
        isDaytime
      });

    } catch (error) {
      console.error("Error fetching the weather data", error);
      setError('Failed to fetch weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityName) fetchWeatherData(cityName, unit);

    const interval = setInterval(() => {
      if (cityName) fetchWeatherData(cityName, unit);
    }, 600000);

    return () => clearInterval(interval);
  }, [cityName, unit]);

  const handleUnitToggle = (newUnit) => {
    setUnit(newUnit);
    if (cityName) fetchWeatherData(cityName, newUnit);
  };

  const goToSearchPage = () => navigate('/search');

  return (
    <div>
      <Header onUnitChange={handleUnitToggle} />
      <div className={styles.weather}>
        <div className={styles.top}>
          <form className={styles.searchBox} onSubmit={handleSearchSubmit}>
            <input
              className={styles.input}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Enter city or village"
            />
            <button className={styles.but} type="button" onClick={goToSearchPage}></button>
          </form>
          <span className={styles.icon} />
        </div>
        <div className={styles.topRight}>
          <button className={styles.toggleButton} onClick={() => handleUnitToggle(unit === 'metric' ? 'imperial' : 'metric')}>
            {unit === 'metric' ? 'Switch to °F' : 'Switch to °C'}
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : weatherData ? (
        <div className={styles.weatherContainer}>
          <h2 className={styles.names1}>
            {weatherData.name}, {weatherData.region ? `${weatherData.region}, ` : ''}{weatherData.country}
          </h2>
          <div className={styles.temperatureContainer}>
            <span className={styles.temp}>{weatherData.temperature}</span>
            <span className={styles.uni}>{weatherData.unit}</span>
          </div>
          <div className={styles.Ima}>
            <img
              className={styles.image}
              src={getWeatherImage(weatherData.condition, weatherData.isDaytime)}
              alt={weatherData.condition}
            />
          </div>
          <div>
            <span className={styles.cond}>{weatherData.condition}</span>
          </div>
          <h3 className={styles.fel}>Feels Like:</h3>
          <div className={styles.feelsLikeContainer}>
            <span className={styles.temp1}>{weatherData.feelsLike}</span>
            <span className={styles.unii}>{weatherData.unit}</span>
          </div>
          <div className={styles.weatherDataAndForecast}>
            <div className={styles.weatherDataContainer}>
              <div className={styles.weatherTableContainer}>
                <table className={styles.weatherTable}>
                <tbody>
                  <tr className={styles.rowSection}>
                    <td><img src={humidityImage} alt="Humidity" /> Humidity</td>
                    <td>{weatherData.humidity}%</td>
                  </tr>
                  <tr className={styles.rowSection}>
                    <td><img src={pressureImage} alt="Pressure" /> Pressure</td>
                    <td>{weatherData.pressure} mmHg</td>
                  </tr>
                  <tr className={styles.rowSection}>
                    <td><img src={visibilityImage} alt="Visibility" /> Visibility</td>
                    <td>{weatherData.visibility} {weatherData.visibilityUnit}</td>
                  </tr>
                  <tr className={styles.rowSeparator} />
                  <tr className={styles.rowSection}>
                    <td><img src={windSpeedImage} alt="Wind Speed" /> Wind Speed</td>
                    <td>{weatherData.windSpeed} {unit === 'metric' ? 'km/h' : 'mph'}</td>
                  </tr>
                  <tr className={styles.rowSection}>
                    <td>Sunrise</td>
                    <td>{weatherData.sunrise}</td>
                  </tr>
                  <tr className={styles.rowSection}>
                    <td>Sunset</td>
                    <td>{weatherData.sunset}</td>
                  </tr>
                </tbody>
                </table>
              </div>
            </div>
            <div className={styles.forecast}>
              <h3 className={styles.names}>5-Day Forecast</h3>
              <table className={styles.forecastTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Morning Temperature "average"</th>
                    <th>Midday Temperature "average"</th>
                    <th>Evening Temperature "average"</th>
                    <th>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherData.forecast.map((day, index) => (
                    <tr key={index}>
                      <td>{day.date}</td>
                      <td>{day.morningTemp !== 'N/A' ? `${day.morningTemp} ${weatherData.unit}` : 'N/A'}</td>
                      <td>{day.middayTemp !== 'N/A' ? `${day.middayTemp} ${weatherData.unit}` : 'N/A'}</td>
                      <td>{day.eveningTemp !== 'N/A' ? `${day.eveningTemp} ${weatherData.unit}` : 'N/A'}</td>
                      <td>{day.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
