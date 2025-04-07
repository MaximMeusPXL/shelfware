import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import ThemeToggle from './components/ThemeToggle.tsx';
import ProjectsOverview from './pages/ProjectsOverview.tsx';
import CreateProject from './pages/CreateProject.tsx';
import EditProject from './pages/EditProject.tsx';
import ProjectDetails from './pages/ProjectDetails.tsx';
import './App.css';
//import './wide-layout.css';
//import './layout-fix.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProjectsOverview />} />
            <Route path="/create" element={<CreateProject />} />
            <Route path="/edit/:id" element={<EditProject />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
          </Routes>
        </main>
        <ThemeToggle />
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} Shelfware Tracker - Track your side projects</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;