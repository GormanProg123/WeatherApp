import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

export const Header = ({ disableSearch = false, showInput = true, onUnitChange }) => {
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
              <form onSubmit={handleSearchSubmit}>
                <input
                  className={styles.google}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Enter city or village"
                  disabled={disableSearch}
                />
              </form>
              <span className={styles.icon} />
            </>
          )}
        </div>
        {isOpen && (
          <nav className={styles.menu}>
            <ul className={styles.list}>
              <li>
                <button
                  className={styles.item}
                  onClick={() => handleUnitChange("metric")}
                >
                  ℃
                </button>
              </li>
              <li>
                <button
                  className={styles.item}
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
