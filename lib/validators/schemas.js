// Validation schemas for API requests
export const schemas = {
  // User schemas
  user: {
    update: {
      name: { type: 'string', maxLength: 100 },
      email: { type: 'string', format: 'email' }
    }
  },

  // Organization schemas
  organization: {
    create: {
      name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
      description: { type: 'string', maxLength: 500 },
      azureContainer: { type: 'string', pattern: '^[a-z0-9-]+$' }
    },
    update: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      description: { type: 'string', maxLength: 500 }
    },
    member: {
      email: { type: 'string', required: true, format: 'email' },
      role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'] }
    },
    invitation: {
      email: { type: 'string', required: true, format: 'email' },
      role: { type: 'string', enum: ['OWNER', 'ADMIN', 'MEMBER'], default: 'MEMBER' }
    },
    tag: {
      name: { type: 'string', required: true, minLength: 1, maxLength: 50 },
      description: { type: 'string', maxLength: 200 },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
    }
  },

  // Course schemas
  course: {
    create: {
      title: { type: 'string', required: true, minLength: 3, maxLength: 200 },
      description: { type: 'string', required: true, maxLength: 1000 },
      type: { type: 'string', enum: ['WISETRAINER', 'WISETWIN'], default: 'WISETRAINER' },
      organizationId: { type: 'string' },
      duration: { type: 'number', min: 0 },
      difficulty: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
      imageUrl: { type: 'string', format: 'url' },
      buildUrl: { type: 'string' }
    },
    update: {
      title: { type: 'string', minLength: 3, maxLength: 200 },
      description: { type: 'string', maxLength: 1000 },
      status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'] },
      duration: { type: 'number', min: 0 },
      difficulty: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
      imageUrl: { type: 'string', format: 'url' },
      buildUrl: { type: 'string' }
    },
    progress: {
      moduleId: { type: 'string' },
      scenarioId: { type: 'string' },
      progress: { type: 'number', min: 0, max: 100 },
      score: { type: 'number', min: 0, max: 100 },
      status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] }
    },
    scenario: {
      answers: { type: 'object', required: true }
    }
  },

  // Session schemas
  session: {
    start: {
      type: { type: 'string', enum: ['TRAINING', 'EXPLORATION'] },
      trainingId: { type: 'string' },
      buildId: { type: 'string' }
    },
    end: {
      sessionId: { type: 'string', required: true },
      duration: { type: 'number', min: 0 }
    }
  },

  // Storage schemas
  storage: {
    container: {
      public: { type: 'boolean', default: false }
    }
  }
};

// Simple validator function
export function validate(data, schema) {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Skip validation if field is not present and not required
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rules.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rules.type) {
        errors[field] = `${field} must be a ${rules.type}`;
        continue;
      }
    }
    
    // String validations
    if (rules.type === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must not exceed ${rules.maxLength} characters`;
      }
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        errors[field] = `${field} has invalid format`;
      }
      if (rules.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = `${field} must be a valid email`;
      }
      if (rules.format === 'url' && !/^https?:\/\/.+/.test(value)) {
        errors[field] = `${field} must be a valid URL`;
      }
    }
    
    // Number validations
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        errors[field] = `${field} must not exceed ${rules.max}`;
      }
    }
    
    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}