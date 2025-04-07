import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../interfaces/Project.ts';
import { formatDate, getStatusColor, formatHardwareInfo } from '../utils/formatters.ts';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const statusStyle = {
    backgroundColor: getStatusColor(project.status)
  };

  return (
    <div className="project-card">
      <div className="project-header">
        <h3>{project.title}</h3>
        <span className="project-status" style={statusStyle}>
          {project.status}
        </span>
      </div>
      
      {project.description && (
        <p className="project-description">{project.description}</p>
      )}
      
      <div className="project-links">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="link-github">
            GitHub
          </a>
        )}
        
        {project.deployedUrl && (
          <a href={project.deployedUrl} target="_blank" rel="noopener noreferrer" className="link-demo">
            Live Demo
          </a>
        )}
        
        {project.docsUrl && (
          <a href={project.docsUrl} target="_blank" rel="noopener noreferrer" className="link-docs">
            Docs
          </a>
        )}
      </div>
      
      {project.hardwareInfo && (
        <div className="hardware-info">
          <h4>Components:</h4>
          <pre>{formatHardwareInfo(project.hardwareInfo)}</pre>
        </div>
      )}
      
      {project.createdAt && (
        <div className="project-metadata">
          <span>Created: {formatDate(project.createdAt)}</span>
          {project.updatedAt && project.updatedAt !== project.createdAt && (
            <span>Updated: {formatDate(project.updatedAt)}</span>
          )}
        </div>
      )}
      
      <div className="project-actions">
        <Link to={`/project/${project.id}`} className="btn btn-view">
          View Details
        </Link>
        <Link to={`/edit/${project.id}`} className="btn btn-edit">
          Edit
        </Link>
        <button 
          onClick={() => onDelete(project.id)} 
          className="btn btn-delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;