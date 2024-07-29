import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './Home';
import { Search } from './pages/search/Search.jsx';
import { City } from './pages/city/City.jsx';

export const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/city" element={<City />} />
        </Routes>
      </div>
    </Router>
  );
};
