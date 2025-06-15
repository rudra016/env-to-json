/**
 * Apply whitelist filter to environment variables
 * @param {Object} env - Environment variables object
 * @param {string[]} whitelist - Array of keys to include
 * @returns {Object} Filtered environment variables
 */
function applyWhitelist(env, whitelist) {
    if (!whitelist || whitelist.length === 0) {
      return env;
    }
    
    const filtered = {};
    for (const key of whitelist) {
      if (env.hasOwnProperty(key)) {
        filtered[key] = env[key];
      }
    }
    
    return filtered;
  }
  
  /**
   * Apply exclude filter to environment variables
   * @param {Object} env - Environment variables object
   * @param {string[]} exclude - Array of keys to exclude
   * @returns {Object} Filtered environment variables
   */
  function applyExclude(env, exclude) {
    if (!exclude || exclude.length === 0) {
      return env;
    }
    
    const filtered = { ...env };
    for (const key of exclude) {
      delete filtered[key];
    }
    
    return filtered;
  }
  
  /**
   * Apply prefix filter to environment variables
   * @param {Object} env - Environment variables object
   * @param {string} prefix - Prefix to filter by
   * @returns {Object} Filtered environment variables
   */
  function applyPrefix(env, prefix) {
    if (!prefix) {
      return env;
    }
    
    const filtered = {};
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith(prefix)) {
        filtered[key] = value;
      }
    }
    
    return filtered;
  }
  
  /**
   * Apply all filters in sequence
   * @param {Object} env - Environment variables object
   * @param {Object} options - Filter options
   * @param {string[]} options.whitelist - Keys to include
   * @param {string[]} options.exclude - Keys to exclude
   * @param {string} options.prefix - Prefix to filter by
   * @returns {Object} Filtered environment variables
   */
  function applyFilters(env, options = {}) {
    let filtered = env;
    
    // Apply prefix filter first (most restrictive)
    if (options.prefix) {
      filtered = applyPrefix(filtered, options.prefix);
    }
    
    // Then apply whitelist (if specified, overrides prefix)
    if (options.whitelist && options.whitelist.length > 0) {
      filtered = applyWhitelist(env, options.whitelist); // Use original env for whitelist
    }
    
    // Finally apply exclude filter
    if (options.exclude && options.exclude.length > 0) {
      filtered = applyExclude(filtered, options.exclude);
    }
    
    return filtered;
  }
  
  /**
   * Validate filter options
   * @param {Object} options - Filter options to validate
   * @returns {Object} Validation result with errors if any
   */
  function validateFilters(options) {
    const errors = [];
    
    if (options.whitelist && options.prefix) {
      console.warn('Warning: Both whitelist and prefix specified. Whitelist takes precedence.');
    }
    
    // Only validate if whitelist is explicitly provided and is an array
    if (options.whitelist && Array.isArray(options.whitelist) && options.whitelist.length === 0) {
      errors.push('Whitelist cannot be empty when specified');
    }
    
    // Only validate if exclude is explicitly provided and is an array
    if (options.exclude && Array.isArray(options.exclude) && options.exclude.length === 0) {
      errors.push('Exclude list cannot be empty when specified');
    }
    
    if (options.prefix !== null && options.prefix !== undefined && typeof options.prefix !== 'string') {
      errors.push('Prefix must be a string');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  module.exports = {
    applyWhitelist,
    applyExclude,
    applyPrefix,
    applyFilters,
    validateFilters
  };