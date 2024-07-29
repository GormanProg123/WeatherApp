import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';
import Cloudy from './assets/Cloudy.png';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className={styles.name}>
        <h3>Weather App</h3>
      </div>
      <div className={styles.text}>
        <h3>Website about <br />the weather in different regions</h3>
      </div>
      <button className={styles.start} onClick={() => navigate('/search')}>
        Start
      </button>
      <div className={styles.image}>
        <img src={Cloudy} alt="Cloudy weather icon" />
      </div>
    </div>
  );
};
