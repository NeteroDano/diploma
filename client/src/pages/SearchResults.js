import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const { results/* , role */ } = location.state || { results: []/* , role: '' */ };
  const navigate = useNavigate();

  const handleResultClick = (name) => {
    navigate(`/profile/${name}`);
  };

  return (
    <div className="container mt-5">
      <h2>Search Results</h2>
      {results.length === 0 ? (
        <p>No results found</p>
      ) : (
        <ul className="list-group">
          {results.map((result) => (
            <li key={result.id} className="list-group-item" onClick={() => handleResultClick(result.name)}>
              {result.name} ({result.role})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
