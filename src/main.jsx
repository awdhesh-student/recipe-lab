import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store';
import './App.css';


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <CssBaseline />
      <App />
    </BrowserRouter>
  </Provider>
);
