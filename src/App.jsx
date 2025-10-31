// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RecipesList from './components/RecipesList';
import CreateRecipe from './components/CreateRecipe';
import CookSession from './components/CookSession';
import MiniPlayer from './components/MiniPlayer';
import './App.css';

export default function App() {
  return (
    <div className="app-wrap">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="/recipes" element={<RecipesList />} />
          <Route path="/create" element={<CreateRecipe />} />
          <Route path="/create/:id" element={<CreateRecipe />} />
          <Route path="/cook" element={<CookSession />} />
          <Route path="/cook/:id" element={<CookSession />} />
          <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
        </Routes>
      </div>

      {/* MiniPlayer component will itself choose when to render (via redux state). It hides when viewing the active recipe cook page because its click navigates there. */}
      <MiniPlayer />
    </div>
  );
}
