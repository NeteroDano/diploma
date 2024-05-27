import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import Home from './components/Home';
import Search from './components/Search';
import SearchResults from './components/SearchResults';
import Messages from './components/Messages';
import CreateMessage from './components/CreateMessage';
import UserProfile from './components/UserProfile';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <Router>
            <div className="App">
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="#">My Web App</a>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            {isAuthenticated ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/">Home</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/profiles/me">Profile</Link>
                                    </li>
                                    <li className="nav-item">
                                        <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/register">Register</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/login">Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/">Home</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                        {isAuthenticated && <Search />}
                    </div>
                </nav>
                <div className="container mt-5">
                    <Routes>
                        <Route path="/register" element={<PublicRoute component={() => <Register handleLogin={handleLogin} />} isAuthenticated={isAuthenticated} />} />
                        <Route path="/login" element={<PublicRoute component={() => <Login handleLogin={handleLogin} />} isAuthenticated={isAuthenticated} />} />
                        <Route path="/" element={<Home handleLogout={handleLogout} isAuthenticated={isAuthenticated} />} />
                        <Route path="/profiles/me" element={<PrivateRoute component={Profile} isAuthenticated={isAuthenticated} />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/search-results" element={<SearchResults />} />
                        <Route path="/profile/:name/*" element={<UserProfile />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
