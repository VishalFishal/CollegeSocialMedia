import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import Linkedin from './pages/Linkedin.jsx';
import Instagram from './pages/Instagram.jsx';
import Register from './pages/Register.jsx';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: "/linkedin_posts",
    element: <Linkedin />,
  },
  {
    path: "/instagram_posts",
    element: <Instagram/>,
  },
  {
    path:"/register",
    element: <Register/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)