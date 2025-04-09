# Authentication System

<!-- vscode-markdown-toc -->
* [Overview](#Overview)
* [Setup](#Setup)
	* [1. Environment Variables](#EnvironmentVariables)
* [Backend Implementation](#BackendImplementation)
	* [Database Schema](#DatabaseSchema)
	* [Authentication Configuration](#AuthenticationConfiguration)
	* [Auth Routes](#AuthRoutes)
	* [Authentication Middleware](#AuthenticationMiddleware)
	* [API Routes Protection](#APIRoutesProtection)
* [Frontend Implementation](#FrontendImplementation)
	* [Authentication Service](#AuthenticationService)
	* [Authentication Context](#AuthenticationContext)
	* [Protected Routes](#ProtectedRoutes)
* [Security Considerations](#SecurityConsiderations)
* [Usage Examples](#UsageExamples)
	* [Protect a Route in React](#ProtectaRouteinReact)
	* [Access Authentication State in a Component](#AccessAuthenticationStateinaComponent)
* [Troubleshooting](#Troubleshooting)
	* [Common Issues](#CommonIssues)

<!-- vscode-markdown-toc-config
	numbering=false
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

This document explains the implementation of token-based authentication in the PXL Shelfware Tracker application.

## <a name='Overview'></a>Overview

The authentication system is built using:
- **Passport.js**: Authentication middleware for Node.js
- **JWT (JSON Web Tokens)**: For secure, stateless authentication
- **bcrypt**: For password hashing
- **React Context API**: For managing authentication state on the frontend

## <a name='Setup'></a>Setup

### <a name='EnvironmentVariables'></a>1. Environment Variables

Add the following to your backend `.env` file:

```
# JWT Secret Key - Change this in production!
JWT_SECRET="your-secure-random-string"
```

For production, generate a unique secure random string for JWT_SECRET.

## <a name='BackendImplementation'></a>Backend Implementation

### <a name='DatabaseSchema'></a>Database Schema

The User and Project models are linked in a one-to-many relationship:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  projects  Project[]
}

model Project {
  id          String   @id @default(cuid())
  // ... other fields
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
}
```

### <a name='AuthenticationConfiguration'></a>Authentication Configuration

The authentication system uses two Passport.js strategies:
1. **Local Strategy**: For email/password login
2. **JWT Strategy**: For token-based authentication

The configuration is in `backend/src/config/passport.ts`.

### <a name='AuthRoutes'></a>Auth Routes

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | /api/auth/register | Create a new user | `{email, password, name?}` | `{user, token}` |
| POST | /api/auth/login | Login with credentials | `{email, password}` | `{user, token}` |
| GET | /api/auth/profile | Get user profile | - | `{id, email, name}` |

The authentication controller is defined in `backend/src/controllers/authController.ts`.

### <a name='AuthenticationMiddleware'></a>Authentication Middleware

Two middleware functions are available:
1. `requireAuth`: Requires a valid JWT token to access a route
2. `optionalAuth`: Attaches user to request if a valid token is present, but doesn't block access

Example from `backend/src/middleware/authMiddleware.ts`:

```typescript
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'You must be logged in to access this resource' 
      });
    }
    
    // User is authenticated, attach to request
    req.user = user;
    next();
  })(req, res, next);
};
```

### <a name='APIRoutesProtection'></a>API Routes Protection

The routes are protected as follows:
- `GET /api/projects`: Uses `optionalAuth` - if authenticated, returns only the user's projects
- `GET /api/projects/:id`: Uses `requireAuth` - checks if project belongs to authenticated user
- `POST /api/projects`: Uses `requireAuth` - associates project with authenticated user
- `PUT /api/projects/:id`: Uses `requireAuth` - checks project ownership
- `DELETE /api/projects/:id`: Uses `requireAuth` - checks project ownership

## <a name='FrontendImplementation'></a>Frontend Implementation

### <a name='AuthenticationService'></a>Authentication Service

The `authService.ts` file provides functions for:
- User registration
- User login
- Token storage and retrieval
- Authenticated HTTP requests

```typescript
// Set token in localStorage
const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${AUTH_URL}/login`, credentials);
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};
```

### <a name='AuthenticationContext'></a>Authentication Context

The `AuthContext.tsx` provides a React context that:
- Tracks authentication state
- Provides user information
- Handles login and logout
- Loads user data on application startup

```typescript
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Values exposed to consumers
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login: (userData: User) => setUser(userData),
    logout: () => {
      removeToken();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### <a name='ProtectedRoutes'></a>Protected Routes

The `ProtectedRoute.tsx` component:
- Checks if a user is authenticated
- Redirects to login if not authenticated
- Shows a loading spinner while checking authentication status

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

## <a name='SecurityConsiderations'></a>Security Considerations

1. **Password Security**:
   - Passwords are hashed using bcrypt with a cost factor of 10
   - Password validation ensures minimum length of 6 characters

2. **JWT Security**:
   - Tokens expire after 7 days
   - JWT secret is configurable via environment variables
   - JWT is sent via Authorization header (Bearer token)

3. **API Security**:
   - CORS is configured to allow requests only from trusted origins
   - Ownership checks ensure users can only access their own projects
   - Input validation prevents security issues

## <a name='UsageExamples'></a>Usage Examples

### <a name='ProtectaRouteinReact'></a>Protect a Route in React

```tsx
// In App.tsx or route definitions
<Route path="/create" element={
  <ProtectedRoute>
    <CreateProject />
  </ProtectedRoute>
} />
```

### <a name='AccessAuthenticationStateinaComponent'></a>Access Authentication State in a Component

```tsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated 
        ? <p>Welcome, {user?.name || user?.email}!</p> 
        : <p>Please log in</p>
      }
    </div>
  );
};
```

## <a name='Troubleshooting'></a>Troubleshooting

### <a name='CommonIssues'></a>Common Issues

1. **"Invalid token" errors**:
   - Check that JWT_SECRET matches the one used to generate tokens
   - Verify that the token hasn't expired

2. **User not loading after refresh**:
   - Ensure token is being properly saved in localStorage
   - Check if getCurrentUser API call is failing

3. **CORS errors**:
   - Verify CORS_ORIGIN in backend .env matches your frontend URL