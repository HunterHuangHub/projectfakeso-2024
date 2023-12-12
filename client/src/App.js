import React, { useState } from "react";
import './stylesheets/App.css';
import LoginPage from './components/login';
import FakeStackOverflow from './components/fakestackoverflow';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (event, name) => {
    event.preventDefault();
    setUsername(name);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername('');
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <section className="fakeso">
      <FakeStackOverflow username={username} onLogout={handleLogout} />
    </section>
  );
}

export default App;