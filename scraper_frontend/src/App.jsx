import React, { useState } from 'react';
import LoginHeader from './components/LoginHeader';
import Tail from './components/Tail';
import { useNavigate, Link } from 'react-router-dom';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      setError('');
      navigate('/instagram_posts');
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <>
      <LoginHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">College Login</h2>
          {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="College Email"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
              Log In
            </button>
            <p className="text-center text-sm">Don't have an account? <Link to="/register"><p className="text-blue-500 hover:underline">Register</p></Link></p>
          </form>
        </div>
      </div>
      <Tail />
    </>
  );
};

export default App;
