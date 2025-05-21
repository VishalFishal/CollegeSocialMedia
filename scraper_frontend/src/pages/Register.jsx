import React, { useState } from 'react';
import LoginHeader from '../components/LoginHeader';
import Tail from '../components/Tail';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('Registered successfully!');
      setTimeout(() => navigate('/'), 1500); // Redirect to login after success
    } else {
      setMessage(data.error || 'Registration failed');
    }
  };

  return (
    <>
      <LoginHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
          {message && <p className="text-center text-sm text-red-500 mb-2">{message}</p>}
          <form onSubmit={handleRegister} className="space-y-4">
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
              Register
            </button>
            <p className="text-center text-sm">Already have an account? <Link to="/"><p className="text-blue-500 hover:underline">Login</p></Link></p>
          </form>
        </div>
      </div>
      <Tail />
    </>
  );
};

export default Register;
