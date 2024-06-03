import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container, Alert } from 'react-bootstrap';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Search from './components/Search';
import SearchResults from './pages/SearchResults';
import VerificationRequest from './pages/VerificationRequest';
import VerificationAdmin from './pages/VerificationAdmin';
import VerificationStatus from './pages/VerificationStatus';
import VerificationAppeal from './pages/VerificationAppeal'; 
import AppealStatus from './pages/AppealStatus'; 
import UserProfile from './components/UserProfile';
import PrivateRoute from './common/PrivateRoute';
import PublicRoute from './common/PublicRoute';
import Messages from './components/Messages';
import CreateMessage from './components/CreateMessage';
import Rewards from './pages/Rewards';
import CreateReward from './components/CreateReward';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const HomeWithMessage = () => {
    const location = useLocation();
    const [message, setMessage] = useState(location.state?.message || '');

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <Container className="mt-5">
            {message && <Alert variant="warning">{message}</Alert>}
            <Home />
        </Container>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            axios.get('http://localhost:3000/profiles/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).then(response => {
                setRole(response.data.role);
            }).catch(error => {
                console.error('Error fetching profile', error);
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setRole('');
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
        const token = localStorage.getItem('token');
        axios.get('http://localhost:3000/profiles/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).then(response => {
            setRole(response.data.role);
        }).catch(error => {
            console.error('Error fetching profile', error);
        });
    };

    return (
        <Router>
            <div className="App">
                <Navbar bg="light" expand="lg">
                    <Navbar.Brand>My Web App</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            {isAuthenticated ? (
                                <>
                                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                                    <Nav.Link as={Link} to="/profiles/me">Profile</Nav.Link>
                                    <NavDropdown title="Verification" id="basic-nav-dropdown">
                                        <NavDropdown.Item as={Link} to="/verification/status">Verification Status</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/verification/submit">Verification Request</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/admin/verification">Verification Admin</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/verification/appeal">Verification Appeal</NavDropdown.Item>
                                        <NavDropdown.Item as={Link} to="/appeal/status">Appeal Status</NavDropdown.Item>
                                    </NavDropdown>
                                    <NavDropdown title="Rewards" id="rewards-nav-dropdown">
                                        <NavDropdown.Item as={Link} to="/rewards">View Rewards</NavDropdown.Item>
                                        {role === 'admin' && (
                                            <NavDropdown.Item as={Link} to="/rewards/create">Create Reward</NavDropdown.Item>
                                        )}
                                    </NavDropdown>
                                    <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/register">Register</Nav.Link>
                                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                    <Nav.Link as={Link} to="/">Home</Nav.Link>
                                </>
                            )}
                        </Nav>
                        {isAuthenticated && <Search />}
                    </Navbar.Collapse>
                </Navbar>
                <div className="container mt-5">
                    <Routes>
                        <Route path="/register" element={<PublicRoute component={() => <Register handleLogin={handleLogin} />} isAuthenticated={isAuthenticated} />} />
                        <Route path="/login" element={<PublicRoute component={() => <Login handleLogin={handleLogin} />} isAuthenticated={isAuthenticated} />} />
                        <Route path="/" element={<HomeWithMessage handleLogout={handleLogout} isAuthenticated={isAuthenticated} />} />
                        <Route path="/profiles/me" element={<PrivateRoute component={Profile} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/search-results" element={<SearchResults />} />
                        <Route path="/profile/:name/*" element={<UserProfile />} />
                        <Route path="/verification/status" element={<PrivateRoute component={VerificationStatus} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/appeal/status" element={<PrivateRoute component={AppealStatus} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/verification/submit" element={<PrivateRoute component={VerificationRequest} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/admin/verification" element={<PrivateRoute component={VerificationAdmin} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/verification/appeal" element={<PrivateRoute component={VerificationAppeal} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/profile/:name/:category" element={<PrivateRoute component={Messages} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/profile/:name/:category/create" element={<PrivateRoute component={CreateMessage} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/rewards" element={<PrivateRoute component={Rewards} isAuthenticated={isAuthenticated} role={role} />} />
                        <Route path="/rewards/create" element={<PrivateRoute component={CreateReward} isAuthenticated={isAuthenticated} role={role} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
