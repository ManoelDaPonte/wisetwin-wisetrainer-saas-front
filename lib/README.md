# Lib Directory Documentation

This directory contains the core business logic, utilities, and shared resources for the WiseTwin/WiseTrainer SaaS application.

## Directory Structure

### `/store` - State Management
Zustand-based state management stores for application-wide state.

- **`contextStore.js`** - Manages active context (Personal/Organization mode)
- **`userStore.js`** - User authentication and profile state
- **`organizationStore.js`** - Organization data and management
- **`courseStore.js`** - Course/training data and enrollment state

### `/hooks` - React Hooks
Custom React hooks organized by functionality.

#### Core Hooks
- **`useAuth.js`** - Authentication state and methods
- **`useUser.js`** - User data management
- **`useActiveContext.js`** - Context switching (Personal/Organization)

#### Context-Aware Hooks
- **`useContextCourses.js`** - Courses filtered by active context
- **`useContextStats.js`** - Statistics based on context
- **`useContextMembers.js`** - Organization members management

#### Domain-Specific Hooks
- **`useOrganization.js`** - Organization operations
- **`useCourse.js`** - Individual course management
- **`useScenario.js`** - Training scenario handling
- **`usePermissions.js`** - Role-based access control

#### Utility Hooks
- **`useToast.js`** - Toast notifications
- **`useTheme.jsx`** - Theme management
- **`use-mobile.js`** - Mobile detection

### `/services` - API Layer
Service layer for backend communication.

#### `/api` - API Clients
- **`userApi.js`** - User profile, stats, courses endpoints
- **`organizationApi.js`** - Organization CRUD, members, invitations
- **`courseApi.js`** - Course enrollment, progress tracking
- **`storageApi.js`** - Azure blob storage operations
- **`sessionApi.js`** - Session tracking and analytics

#### `/adapters` - Service Adapters
Bridges between old and new API patterns for smooth migration.

### `/middleware` - Request Processing
Next.js API route middleware.

- **`auth.js`** - Authentication verification
- **`errorHandler.js`** - Centralized error handling
- **`permissions.js`** - Permission validation

### `/components` - Utility Components
- **`ZustandInitializer.jsx`** - Initializes stores on app mount

### `/config` - Configuration
- **`config.jsx`** - Application configuration (navigation, stats, etc.)
- **`/wisetrainer/courses/`** - Course configuration JSON files
- **`/wisetwin/`** - WiseTwin specific configurations

### `/utils` - Utilities
- **`cache.js`** - Centralized caching system with TTL

### `/validators` - Data Validation
- **`schemas.js`** - Request/response validation schemas

### `/contexts` - React Contexts
- **`ThemeContext.jsx`** - Theme provider

### `/data` - Static Data
- **`dashboardData.jsx`** - Dashboard configuration and mockups

## Key Features

### Context-Aware Architecture
The application supports two main contexts:
- **Personal Mode** - User's personal trainings and data
- **Organization Mode** - Organization-specific data and management

Hooks automatically adapt their data based on the active context.

### State Management Pattern
```
Component → Hook → Zustand Store → API Service → Backend
```

### Caching Strategy
- User-isolated cache keys: `user_${userId}_${resource}`
- TTL-based cache invalidation
- Automatic cache clearing on context switch

### Permission System
Role-based access control with three levels:
- **OWNER** - Full organization control
- **ADMIN** - Management capabilities
- **MEMBER** - Basic access

## Usage Examples

### Using Context-Aware Hooks
```javascript
import { useContextCourses } from '@/lib/hooks';

function MyComponent() {
  const { courses, loading, enrollInCourse } = useContextCourses();
  // Data automatically filtered based on active context
}
```

### Managing Active Context
```javascript
import { useActiveContext } from '@/lib/hooks';

function ContextSwitcher() {
  const { activeContext, setActiveContext } = useActiveContext();
  
  const switchToOrganization = (orgId) => {
    setActiveContext({ type: 'organization', id: orgId });
  };
}
```

### API Service Usage
```javascript
import { courseApi } from '@/lib/services/api';

// Direct API usage (usually handled by hooks)
const courses = await courseApi.getUserCourses(userId);
```

## Conventions

### Naming
- Hooks: `use[Feature]` (e.g., `useUser`, `useOrganization`)
- APIs: `[domain]Api` (e.g., `userApi`, `courseApi`)
- Stores: `use[Domain]Store` (e.g., `useUserStore`)

### Error Handling
- All API errors are standardized
- Stores maintain loading and error states
- Middleware handles common error scenarios

### Performance
- Selective Zustand subscriptions for optimal re-renders
- Memoized computations in hooks
- Automatic request deduplication

## Dependencies

- **zustand** - State management
- **swr** - Data fetching and caching (in some hooks)
- **next** - Next.js framework utilities
- **@auth0/nextjs-auth0** - Authentication

## Contributing

When adding new features:
1. Follow existing naming conventions
2. Add appropriate TypeScript types (when applicable)
3. Include error handling
4. Update relevant documentation
5. Consider context-aware behavior