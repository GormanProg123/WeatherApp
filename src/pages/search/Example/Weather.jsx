import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

export const Weather = ({ name, country, temperature, condition, unit }) => {
  const navigate = useNavigate();

  const handleWatchMore = () => {
    navigate('/city', { state: { name, unit } });
  };

  return (
    <div className={styles.table}>
      <h2 className={styles.location}>
        <span className={styles.name}>{name}</span>
        <span className={styles.country}>{country}</span>
      </h2>
      <div className={styles.temp}>
        <span className={styles.tempa}>{temperature}</span>
        <span className={styles.uni}>{unit}</span>
      </div>
      <div className={styles.condition}>
        <span className={styles.cond}>{condition}</span>
      </div>
      <button className={styles.button} onClick={handleWatchMore}>
        Watch more
      </button>
    </div>
  );
};
