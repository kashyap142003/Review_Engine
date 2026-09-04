import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { product } from './lib/config';
import './tokens.css';

// White-label identity comes from project configuration only (never hardcoded).

// Fall back to light for any unset/invalid stored theme value.
const savedTheme = localStorage.getItem('review-engine-theme');
const theme = savedTheme === 'dark' ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', theme);
document.documentElement.style.setProperty('--accent', product.accent);

document.title = product.name;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);