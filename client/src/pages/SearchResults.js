import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const { results } = location.state || { results: [] };
  const navigate = useNavigate();

  const handleResultClick = (name) => {
    try {
        navigate(`/profile/${name}`);
    } catch (error) {
        console.error('Error navigating to profile', error);
        alert('Failed to navigate to profile');
    }
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
