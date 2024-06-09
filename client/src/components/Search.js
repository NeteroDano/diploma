import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to log in to perform a search.');
      return;
    }

    try {
       const response = await axios.get(`http://localhost:3000/search`, {
     // const response = await axios.get(`https://diploma-2507928da0ba.herokuapp.com/search`, {
        params: { role, query },
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/search-results', { state: { results: response.data } });
    } catch (error) {
      console.error('Error performing search', error);
      alert('Failed to perform search');
    }
  };

  return (
    <form className="form-inline my-2 my-lg-0" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
      <select
        className="form-control mr-sm-2"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ marginRight: '10px' }}
      >
        <option value="user">Users</option>
        <option value="author">Authors</option>
        <option value="studio">Studios</option>
      </select>
      <input
        className="form-control mr-sm-2"
        type="search"
        placeholder="Search"
        aria-label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
    </form>
  );
};

export default Search;
