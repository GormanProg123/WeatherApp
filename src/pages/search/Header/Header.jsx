import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

export const Header = ({ disableSearch = false, showInput = true, onUnitChange }) => {
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(""); 

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/city', { state: { name: searchTerm } });
  };

  const handleButtonClick = () => {
    navigate('/search');
  };

  const toggleMenu = () => {
    setOpen(!isOpen);
  };

  const handleUnitChange = (newUnit) => {
    setSelectedUnit(newUnit); 
    if (onUnitChange) {
      onUnitChange(newUnit);
    }
  };

  return (
    <div className="Search">
      <header className={styles.main}>
        <div className={styles.search}>
          {showInput && !disableSearch && (
            <>
              <button
                className={styles.but}
                onClick={handleButtonClick}
                disabled={disableSearch}
              ></button>
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input
                  className={styles.google}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Enter city or village"
                  disabled={disableSearch}
                />
                <span className={styles.icon} onClick={handleSearchSubmit} />
              </form>
            </>
          )}
        </div>
        {isOpen && (
          <nav className={styles.menu}>
            <ul className={styles.list}>
              <li>
                <button
                  className={`${styles.item} ${selectedUnit === "metric" ? styles.selected : ''}`} 
                  onClick={() => handleUnitChange("metric")}
                >
                  ℃
                </button>
              </li>
              <li>
                <button
                  className={`${styles.item} ${selectedUnit === "imperial" ? styles.selected : ''}`} 
                  onClick={() => handleUnitChange("imperial")}
                >
                  ℉
                </button>
              </li>
            </ul>
          </nav>
        )}
        <button
          className={`${styles.op} ${isOpen ? styles.opActive : ''}`}
          onClick={toggleMenu}
        ></button>
      </header>
    </div>
  );
};
