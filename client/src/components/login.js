import React, { useState, useEffect } from "react";
import axios from 'axios';
import FakeStackOverflow from './fakestackoverflow';
import { UserTypes } from "./utils";

export default function LoginPage() {

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profiles, setAllProfiles] = useState([])
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [loginInfo, setLoginInfo] = useState({
    user_type: '',
    user_profile: ''
  });
  // GRABS profiles from backend
  useEffect(() => {
    axios.get('http://localhost:8000/profiles').then(function(response) {
      setAllProfiles(response.data)
    })
  }, [])

  const handleNewUserClick = () => {
    setShowRegistrationForm(true);
  };

  const handleExistingUserClick = () => {
    setShowLoginForm(true);
  };

  const handleGuestUserClick = () => {
    setLoginInfo({user_type: UserTypes.GUEST})
    setIsLoggedIn(true);
  };

  const handleBackUserClick = () => {
    setShowRegistrationForm(false);
    setShowLoginForm(false);
  }

  // REGISTRATION
  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
  
    if (!areFieldsValid()) return;
  
    try {
      await registerNewProfile();
      setAllProfiles(await fetchAllProfiles());
      
      setShowRegistrationForm(false);
      setShowLoginForm(true); // Set showLoginForm state to true after registration
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.'); // User-friendly error message
    }
  };
  
  function areFieldsValid() {
    if (username === '' || email === '' || password === '' || confirmPassword === '') {
      alert('All fields are required!');
      return false;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Invalid email format!');
      return false;
    }
  
    if (profiles.find(profile => profile.email === email)) {
      alert('Email already exists!');
      return false;
    }
  
    if (password.includes(username) || password.includes(email)) {
      alert('Password cannot contain username or email!');
      return false;
    }
  
    return true;
  }
  
  async function registerNewProfile() {
    let profile = { username, email, password };
    await axios.post('http://localhost:8000/post_profile', { profile });
  }
  
  async function fetchAllProfiles() {
    const response = await axios.get('http://localhost:8000/profiles');
    return response.data;
  }

  if (showRegistrationForm) {
    return (
      <div className="center">
        <h1 className="h1">Register</h1>
        <form onSubmit={handleRegistrationSubmit}>
          <div>
            <label>Username:</label>
            <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
          <div>
            <label>Email:</label>
            <input type="text" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
          <button type="submit">SignUp</button>
        </form>

        <button onClick = {handleBackUserClick}>Back</button>
      </div>
    );
  }

  // LOGIN
  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    // Find profile in users section
    let currProfile = profiles.find(profile => profile.email === email)
    if (currProfile === undefined) {
      alert('Email not registered!');
      return;
    }

    await axios.post('http://localhost:8000/login', { email, password }).then(
      function (res) {
        if (res.data === 'Good') {
          if (currProfile.isAdmin === true) {
            setLoginInfo({user_type: UserTypes.ADMIN, user_profile: currProfile})
          }
          else {
            setLoginInfo({user_type: UserTypes.USER, user_profile: currProfile})
          }
          setIsLoggedIn(true);
          return;
        }
        else {
          alert('Password incorrect!');
          return;
        }
      }
    ).catch(error => {
        console.error('Login error:', error);
        alert('Failed to log in. Please try again.');
    });
  };

  if (isLoggedIn) {
    return <FakeStackOverflow loginInfo = {loginInfo} />;
  }

  if (showLoginForm) {
    return (
      <div className="center">
        <h1>Login</h1>
        <div className="login-box">
          <form onSubmit={handleLoginSubmit}>
            <label>
              Email:
              <input type="text" name="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <br />
            <label>
              Password:
              <input type="password" name="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <br />
            <button type="submit">Login</button>
          </form>
        </div>

        <button onClick = {handleBackUserClick}>Back</button>
      </div>
    );
  }

  return (
    <div className="center">
      <h1>Welcome!</h1>
      <div className="btn-container">
        <button className="btn" onClick={handleNewUserClick}>
          New User
        </button>
        <button className="btn" onClick={handleExistingUserClick}>
          Existing User
        </button>
        <button className="btn" onClick={handleGuestUserClick}>
          Guest User
        </button>
      </div>
    </div>
  );
}