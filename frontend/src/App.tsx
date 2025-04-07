// src/App.tsx
import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import './App.css';

// Define Project interface
interface Project {
  id: number;
  title: string;
  status: string;
  description?: string;
  githubUrl?: string;
  deployedUrl?: string;
  docsUrl?: string;
  hardwareInfo?: any;
}

// New project form state interface
interface ProjectForm {
  title: string;
  status: string;
  description: string;
  githubUrl: string;
  deployedUrl: string;
  docsUrl: string;
  hardwareInfo: string;
}

// Use the backend URL (ensure backend is running on this port)
const API_URL = 'http://localhost:3001/api/projects';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  // Form state
  const [newProject, setNewProject] = useState<ProjectForm>({
    title: '',
    status: 'Planning', // Default status
    description: '',
    githubUrl: '',
    deployedUrl: '',
    docsUrl: '',
    hardwareInfo: ''
  });

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = () => {
    setLoading(true);
    axios.get(API_URL)
      .then(response => {
        setProjects(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
        setError('Failed to load projects. Is the backend running?');
        setLoading(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    try {
      // Convert hardwareInfo to JSON if it's not empty
      const projectData = {
        ...newProject,
        hardwareInfo: newProject.hardwareInfo ? JSON.parse(newProject.hardwareInfo) : undefined
      };
      
      await axios.post(API_URL, projectData);
      
      // Reset form
      setNewProject({
        title: '',
        status: 'Planning',
        description: '',
        githubUrl: '',
        deployedUrl: '',
        docsUrl: '',
        hardwareInfo: ''
      });
      
      setFormSuccess('Project created successfully!');
      fetchProjects(); // Refresh the project list
    } catch (err) {
      console.error("Error creating project:", err);
      setFormError('Failed to create project. Check your input and try again.');
      
      // If hardwareInfo parsing failed
      if (err instanceof SyntaxError) {
        setFormError('Invalid JSON in hardware info field. Please use valid JSON format.');
      }
    }
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="App">
      <h1>Shelfware Tracker</h1>
      
      {/* Project Form */}
      <div className="project-form">
        <h2>Add New Project</h2>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
        {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newProject.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={newProject.status}
              onChange={handleInputChange}
              required
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Abandoned">Abandoned</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newProject.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="githubUrl">GitHub URL</label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={newProject.githubUrl}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="deployedUrl">Deployed URL</label>
            <input
              type="url"
              id="deployedUrl"
              name="deployedUrl"
              value={newProject.deployedUrl}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="docsUrl">Documentation URL</label>
            <input
              type="url"
              id="docsUrl"
              name="docsUrl"
              value={newProject.docsUrl}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="hardwareInfo">Hardware Info (JSON format)</label>
            <textarea
              id="hardwareInfo"
              name="hardwareInfo"
              value={newProject.hardwareInfo}
              onChange={handleInputChange}
              placeholder='{"cpu": "Raspberry Pi 4", "memory": "4GB"}'
              rows={3}
            />
          </div>
          
          <button type="submit">Create Project</button>
        </form>
      </div>
      
      {/* Project List */}
      <div className="project-list">
        <h2>My Mini Projects</h2>
        {projects.length === 0 ? (
          <p>No projects yet. Add one above!</p>
        ) : (
          <ul>
            {projects.map(project => (
              <li key={project.id} className="project-card">
                <h3>{project.title} <span className="status">{project.status}</span></h3>
                {project.description && <p>{project.description}</p>}
                
                <div className="project-links">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
                  )}
                  {project.deployedUrl && (
                    <a href={project.deployedUrl} target="_blank" rel="noopener noreferrer">Live Demo</a>
                  )}
                  {project.docsUrl && (
                    <a href={project.docsUrl} target="_blank" rel="noopener noreferrer">Docs</a>
                  )}
                </div>
                
                {project.hardwareInfo && (
                  <div className="hardware-info">
                    <h4>Hardware:</h4>
                    <pre>{JSON.stringify(project.hardwareInfo, null, 2)}</pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;