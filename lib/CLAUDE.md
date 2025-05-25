# Technical Documentation for Claude - WiseTwin/WiseTrainer Lib

## Architecture Overview

The `/lib` directory implements a modern, scalable architecture for a SaaS training platform with multi-tenant support.

### Core Architecture Principles

1. **Context-Aware Data Flow**: All data operations are filtered through the active context (Personal or Organization)
2. **State Management**: Zustand stores provide centralized state with selective subscriptions
3. **API Abstraction**: Service layer abstracts all backend communication
4. **Middleware Pipeline**: Consistent auth, error handling, and permissions across all API routes
5. **Smart Caching**: User-isolated, TTL-based caching with automatic invalidation

## Technical Implementation Details

### State Management Architecture

#### Zustand Stores
Each store follows this pattern:
```javascript
const useStore = create((set, get) => ({
  // State
  data: null,
  loading: false,
  error: null,
  
  // Actions
  fetchData: async () => {
    set({ loading: true });
    try {
      const data = await api.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  
  // Computed values
  get computedValue() {
    return processData(get().data);
  }
}));
```

#### Store Interactions
- **contextStore** ← Controls which data other stores fetch
- **userStore** ← Provides authentication state
- **organizationStore** ← Manages org data when in org context
- **courseStore** ← Fetches courses based on active context

### API Layer Architecture

#### Service Pattern
```javascript
// API Service
export const courseApi = {
  getUserCourses: async (userId) => {
    const response = await fetch(`/api/v1/users/${userId}/courses`);
    return handleResponse(response);
  },
  
  getOrganizationCourses: async (orgId) => {
    const response = await fetch(`/api/v1/organizations/${orgId}/courses`);
    return handleResponse(response);
  }
};

// Service Adapter (bridges v0 and v1 APIs)
export const courseServiceAdapter = {
  getCourses: async (context) => {
    if (context.type === 'personal') {
      return courseApi.getUserCourses(context.userId);
    } else {
      return courseApi.getOrganizationCourses(context.id);
    }
  }
};
```

### Hook Architecture

#### Context-Aware Hook Pattern
```javascript
export function useContextCourses() {
  const { activeContext } = useActiveContext();
  const { user } = useUser();
  
  // Subscribe to relevant store slice
  const courses = useCourseStore(state => 
    activeContext.type === 'personal' 
      ? state.userCourses 
      : state.organizationCourses
  );
  
  // Fetch data when context changes
  useEffect(() => {
    if (activeContext.type === 'personal') {
      courseStore.fetchUserCourses(user.id);
    } else {
      courseStore.fetchOrganizationCourses(activeContext.id);
    }
  }, [activeContext]);
  
  return { courses, ...methods };
}
```

### Caching System

#### Cache Implementation
```javascript
class Cache {
  constructor() {
    this.cache = new Map();
  }
  
  set(key, value, ttl = 5 * 60 * 1000) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  clearUserCache(userId) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`user_${userId}_`)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Middleware Pipeline

#### Auth Middleware
```javascript
export function withAuth(handler) {
  return async (request, context) => {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    request.user = session.user;
    return handler(request, context);
  };
}
```

#### Permission Middleware
```javascript
export function requirePermission(permission) {
  return (handler) => async (request, context) => {
    const { organizationId } = context.params;
    const userRole = await getUserRole(request.user.id, organizationId);
    
    if (!hasPermission(userRole, permission)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return handler(request, context);
  };
}
```

### API Route Patterns

#### V1 API Structure
```
/api/v1/
├── auth/          # Authentication endpoints
├── courses/       # Course management
├── organizations/ # Organization management
├── sessions/      # Session tracking
├── storage/       # File storage operations
└── users/         # User management
```

#### Route Implementation Pattern
```javascript
// GET /api/v1/organizations/[orgId]/members
export const GET = withErrorHandler(
  withAuth(
    requirePermission('members.read')(
      async (request, { params }) => {
        const members = await organizationService.getMembers(params.orgId);
        return NextResponse.json(members);
      }
    )
  )
);
```

## Key Technical Features

### 1. Automatic Context Switching
When user switches between Personal and Organization mode:
- All hooks re-fetch appropriate data
- Cache is cleared for previous context
- UI updates automatically

### 2. Permission System
Role hierarchy:
- **OWNER**: Can manage organization, invite/remove members, delete org
- **ADMIN**: Can manage members, courses, view analytics
- **MEMBER**: Can view courses and own progress

### 3. Error Handling
Standardized error responses:
```javascript
{
  error: "Human readable message",
  code: "ERROR_CODE",
  details: { /* additional context */ }
}
```

### 4. Performance Optimizations

#### Selective Subscriptions
```javascript
// Only re-render when specific fields change
const userName = useUserStore(state => state.user?.name);
```

#### Request Deduplication
Multiple components requesting same data result in single API call.

#### Lazy Loading
Heavy operations are deferred until needed.

## Migration Strategy

Currently supporting both v0 and v1 APIs:
- New features use v1 API
- Adapters bridge v0 to v1 patterns
- Gradual migration without breaking changes

## Security Considerations

1. **Authentication**: Auth0 session validation on every request
2. **Authorization**: Role-based permissions checked server-side
3. **Data Isolation**: Users can only access their own data or org data they belong to
4. **Input Validation**: Schema validation on all API inputs
5. **Error Messages**: Production errors don't leak sensitive info

## Testing Approach

### Unit Testing Hooks
```javascript
// Mock stores and test hook behavior
jest.mock('@/lib/store/userStore');
```

### Integration Testing APIs
```javascript
// Test full middleware pipeline
const response = await fetch('/api/v1/courses', {
  headers: { Authorization: 'Bearer token' }
});
```

## Common Patterns and Solutions

### Problem: Data consistency across contexts
**Solution**: Context-aware hooks automatically handle data switching

### Problem: Performance with large datasets
**Solution**: Pagination, virtualization, and selective loading

### Problem: Complex permission logic
**Solution**: Centralized permission middleware with clear role definitions

### Problem: API versioning
**Solution**: Adapter pattern allows smooth migration

## Future Considerations

1. **TypeScript Migration**: Add type safety across the codebase
2. **Real-time Updates**: WebSocket integration for live data
3. **Offline Support**: Service worker for offline functionality
4. **GraphQL**: Consider GraphQL for more flexible data fetching
5. **Microservices**: Split into domain-specific services

## Debugging Tips

1. **Check Active Context**: Most issues stem from wrong context
2. **Verify Permissions**: Use browser DevTools to check user roles
3. **Cache Issues**: Clear cache with `cache.clear()` in console
4. **API Errors**: Check Network tab for detailed error responses
5. **Store State**: Use Zustand DevTools for state inspection