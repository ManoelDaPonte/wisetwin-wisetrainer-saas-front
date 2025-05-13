/**
 * Checks which file extensions are available for a Unity build
 * This function tests for common patterns of Unity build files
 * and returns the correct paths to use in the UnityContext
 * 
 * @param {string} courseId - The course ID to check
 * @param {string} basePath - Optional base path, defaults to '/build/'
 * @returns {object} An object with the path patterns to use
 */
export const getUnityBuildPaths = async (courseId, basePath = '/build/') => {
  // Always check for loader.js first as it must exist
  const loaderUrl = `${basePath}${courseId}.loader.js`;
  
  // Initialize the result object
  const result = {
    loaderUrl,
    dataUrl: null,
    frameworkUrl: null,
    codeUrl: null
  };
  
  try {
    // Check if loader exists - this is required
    const loaderExists = await fileExists(loaderUrl);
    
    if (!loaderExists) {
      throw new Error(`Loader not found: ${loaderUrl}`);
    }
    
    // Get available extension patterns
    const availablePatterns = await checkAvailableUnityFileExtensions(courseId, basePath);
    
    if (availablePatterns.length === 0) {
      throw new Error(`No compatible Unity build file patterns found for ${courseId}`);
    }
    
    // Use the first available pattern (prioritized by the order in checkAvailableUnityFileExtensions)
    const patternToUse = availablePatterns[0];
    console.log(`Using Unity build pattern: ${patternToUse} for ${courseId}`);
    
    // Extension pattern map
    const extensionPatterns = {
      'unityweb': {
        data: '.data.unityweb',
        framework: '.framework.js.unityweb',
        wasm: '.wasm.unityweb'
      },
      'gz': {
        data: '.data.gz',
        framework: '.framework.js.gz',
        wasm: '.wasm.gz'
      },
      'uncompressed': {
        data: '.data',
        framework: '.framework.js',
        wasm: '.wasm'
      }
    };
    
    const selectedPattern = extensionPatterns[patternToUse];
    
    // Build the final result with the selected pattern
    result.dataUrl = `${basePath}${courseId}${selectedPattern.data}`;
    result.frameworkUrl = `${basePath}${courseId}${selectedPattern.framework}`;
    result.codeUrl = `${basePath}${courseId}${selectedPattern.wasm}`;
    
    return result;
  } catch (error) {
    console.error(`Error checking Unity build files: ${error.message}`);
    
    // Fall back to default file patterns with .gz extension (most common)
    return {
      loaderUrl: `${basePath}${courseId}.loader.js`,
      dataUrl: `${basePath}${courseId}.data.gz`,
      frameworkUrl: `${basePath}${courseId}.framework.js.gz`,
      codeUrl: `${basePath}${courseId}.wasm.gz`
    };
  }
};

/**
 * Synchronous version that doesn't check file existence but returns
 * a best guess based on the provided course ID and optimistic file patterns
 * 
 * @param {string} courseId - The course ID to check
 * @param {string} preferredExtension - Preferred extension pattern ('gz', 'unityweb', or '')
 * @returns {object} An object with the path patterns to use
 */
export const getUnityBuildPathsSync = (courseId, preferredExtension = 'gz') => {
  let extensionPattern;
  
  switch (preferredExtension) {
    case 'unityweb':
      extensionPattern = {
        data: '.data.unityweb',
        framework: '.framework.js.unityweb',
        wasm: '.wasm.unityweb'
      };
      break;
    case 'gz':
      extensionPattern = {
        data: '.data.gz',
        framework: '.framework.js.gz',
        wasm: '.wasm.gz'
      };
      break;
    default:
      extensionPattern = {
        data: '.data',
        framework: '.framework.js',
        wasm: '.wasm'
      };
  }
  
  return {
    loaderUrl: `/build/${courseId}.loader.js`,
    dataUrl: `/build/${courseId}${extensionPattern.data}`,
    frameworkUrl: `/build/${courseId}${extensionPattern.framework}`,
    codeUrl: `/build/${courseId}${extensionPattern.wasm}`
  };
};

/**
 * Helper function to check if a file exists at the specified URL
 * 
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} Whether the file exists
 */
export const fileExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.log(`Error checking if file exists at ${url}:`, error.message);
    return false;
  }
};

/**
 * Function to check available Unity file extensions for a course
 * This can be used in components or API routes
 * 
 * @param {string} courseId - The course ID to check
 * @param {string} basePath - Optional base path, defaults to '/build/'
 * @returns {Promise<Array<string>>} Array of available file extensions
 */
export const checkAvailableUnityFileExtensions = async (courseId, basePath = '/build/') => {
  const allExtensions = {
    data: ['.data.unityweb', '.data.gz', '.data'],
    framework: ['.framework.js.unityweb', '.framework.js.gz', '.framework.js'],
    wasm: ['.wasm.unityweb', '.wasm.gz', '.wasm']
  };
  
  // Create an array to store available patterns
  const availablePatterns = [];
  
  // Check loader first because it's always required
  const loaderExists = await fileExists(`${basePath}${courseId}.loader.js`);
  
  if (!loaderExists) {
    console.warn(`No loader found for ${courseId}`);
    return availablePatterns; // If no loader, return empty array
  }
  
  // Create an extension pattern map for organized checking
  const extensionPatterns = [
    // Pattern 1: .unityweb
    {
      name: 'unityweb',
      data: '.data.unityweb',
      framework: '.framework.js.unityweb',
      wasm: '.wasm.unityweb'
    },
    // Pattern 2: .gz
    {
      name: 'gz', 
      data: '.data.gz',
      framework: '.framework.js.gz',
      wasm: '.wasm.gz'
    },
    // Pattern 3: no compression
    {
      name: 'uncompressed',
      data: '.data',
      framework: '.framework.js',
      wasm: '.wasm'
    }
  ];
  
  // Check each pattern
  for (const pattern of extensionPatterns) {
    const dataExists = await fileExists(`${basePath}${courseId}${pattern.data}`);
    const frameworkExists = await fileExists(`${basePath}${courseId}${pattern.framework}`);
    const wasmExists = await fileExists(`${basePath}${courseId}${pattern.wasm}`);
    
    if (dataExists && frameworkExists && wasmExists) {
      availablePatterns.push(pattern.name);
    }
  }
  
  return availablePatterns;
};

export default getUnityBuildPaths;