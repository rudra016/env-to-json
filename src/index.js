const yaml = require('js-yaml');
const { readFile, writeFile, fileExists, maskSecrets } = require('./utils');
const { applyFilters, validateFilters } = require('./filters');

/**
 * Parse .env file content into key-value pairs
 * @param {string} content - .env file content
 * @returns {Object} Parsed environment variables
 */
function parseEnv(content) {
  const env = {};
  const lines = content.split('\n');
  
  for (let line of lines) {
    // Remove comments and trim whitespace
    line = line.split('#')[0].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Find the first = sign
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) continue;
    
    const key = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();
    
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Handle escaped characters
    value = value.replace(/\\n/g, '\n')
                 .replace(/\\r/g, '\r')
                 .replace(/\\t/g, '\t')
                 .replace(/\\\\/g, '\\')
                 .replace(/\\"/g, '"')
                 .replace(/\\'/g, "'");
    
    env[key] = value;
  }
  
  return env;
}

/**
 * Convert object to specified format
 * @param {Object} obj - Object to convert
 * @param {string} format - Output format (json, yaml, js)
 * @returns {string} Formatted string
 */
function formatOutput(obj, format = 'json') {
  switch (format.toLowerCase()) {
    case 'json':
      return JSON.stringify(obj, null, 2);
    
    case 'yaml':
      return yaml.dump(obj, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });
    
    case 'js':
      return `module.exports = ${JSON.stringify(obj, null, 2)};`;
    
    default:
      throw new Error(`Unsupported format: ${format}. Supported formats: json, yaml, js`);
  }
}

/**
 * Generate .env.example file from environment variables
 * @param {Object} env - Environment variables object
 * @returns {string} .env.example content
 */
function generateExample(env) {
  const lines = [];
  
  for (const key of Object.keys(env).sort()) {
    lines.push(`${key}=`);
  }
  
  return lines.join('\n') + '\n';
}

/**
 * Main function to convert .env to specified format
 * @param {Object} options - Conversion options
 * @returns {Object} Result object with success status and data/error
 */
function convertEnv(options = {}) {
  const {
    file = '.env',
    format = 'json',
    output = null,
    whitelist = [],
    exclude = [],
    prefix = null,
    redact = [],
    generateExample: shouldGenerateExample = false
  } = options;
  
  try {
    // Validate filter options - only validate if options are actually provided
    const filterOptions = {};
    if (whitelist && whitelist.length > 0) filterOptions.whitelist = whitelist;
    if (exclude && exclude.length > 0) filterOptions.exclude = exclude;
    if (prefix) filterOptions.prefix = prefix;
    
    const filterValidation = validateFilters(filterOptions);
    if (!filterValidation.valid) {
      return {
        success: false,
        error: `Filter validation failed: ${filterValidation.errors.join(', ')}`
      };
    }
    
    // Check if file exists, fallback to .env
    let envFile = file;
    if (!fileExists(envFile)) {
      if (envFile !== '.env' && fileExists('.env')) {
        envFile = '.env';
        console.warn(`File ${file} not found, using .env instead`);
      } else {
        return {
          success: false,
          error: `Environment file not found: ${envFile}`
        };
      }
    }
    
    // Read and parse .env file
    const content = readFile(envFile);
    let env = parseEnv(content);
    
    // Generate example file if requested
    if (shouldGenerateExample) {
      const exampleContent = generateExample(env);
      const exampleFile = envFile.replace(/\.env.*$/, '.env.example');
      writeFile(exampleFile, exampleContent);
      return {
        success: true,
        message: `Generated ${exampleFile}`,
        data: exampleContent
      };
    }
    
    // Apply filters
    env = applyFilters(env, { whitelist, exclude, prefix });
    
    // Apply secret masking
    if (redact.length > 0) {
      env = maskSecrets(env, redact);
    }
    
    // Format output
    const formattedOutput = formatOutput(env, format);
    
    // Write to file or return for stdout
    if (output) {
      writeFile(output, formattedOutput);
      return {
        success: true,
        message: `Output written to ${output}`,
        data: formattedOutput
      };
    }
    
    return {
      success: true,
      data: formattedOutput
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Load environment variables from .env file
 * @param {string} filePath - Path to .env file
 * @returns {Object} Parsed environment variables
 */
function loadEnv(filePath = '.env') {
  if (!fileExists(filePath)) {
    throw new Error(`Environment file not found: ${filePath}`);
  }
  
  const content = readFile(filePath);
  return parseEnv(content);
}

module.exports = {
  convertEnv,
  loadEnv,
  parseEnv,
  formatOutput,
  generateExample
};