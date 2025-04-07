import axios from 'axios';
import { Project, ProjectFormData } from '../interfaces/Project';

// Get the API URL from environment variables or use a default for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/projects';

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get a single project by ID
export const getProjectById = async (id: string): Promise<Project> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a new project
export const createProject = async (projectData: ProjectFormData): Promise<Project> => {
  // Process hardware info from string to JSON if provided
  const processedData = {
    ...projectData,
    hardwareInfo: projectData.hardwareInfo ? JSON.parse(projectData.hardwareInfo) : undefined
  };
  
  const response = await axios.post(API_URL, processedData);
  return response.data;
};

// Update an existing project
export const updateProject = async (id: string, projectData: ProjectFormData): Promise<Project> => {
  // Process hardware info from string to JSON if provided
  const processedData = {
    ...projectData,
    hardwareInfo: projectData.hardwareInfo ? JSON.parse(projectData.hardwareInfo) : undefined
  };
  
  const response = await axios.put(`${API_URL}/${id}`, processedData);
  return response.data;
};

// Delete a project
export const deleteProject = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};