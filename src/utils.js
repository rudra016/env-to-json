const fs = require('fs');
const path = require('path');

/**
 * Read file content with error handling
 * @param {string} filePath - Path to the file
 * @returns {string} File content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Write content to file with error handling
 * @param {string} filePath - Path to write to
 * @param {string} content - Content to write
 */
function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Check if file exists
 * @param {string} filePath - Path to check
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Mask sensitive values in an object
 * @param {Object} obj - Object to mask
 * @param {string[]} redactKeys - Keys to redact
 * @returns {Object} Masked object
 */
function maskSecrets(obj, redactKeys = []) {
  if (!redactKeys.length) return obj;
  
  const masked = { ...obj };
  const redactPattern = new RegExp(redactKeys.join('|'), 'i');
  
  for (const [key, value] of Object.entries(masked)) {
    if (redactPattern.test(key) || redactPattern.test(String(value))) {
      masked[key] = '***REDACTED***';
    }
  }
  
  return masked;
}

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed arguments
 */
function parseArgs(args) {
  const parsed = {
    file: '.env',
    format: 'json',
    output: null,
    whitelist: [],
    exclude: [],
    prefix: null,
    redact: [],
    generateExample: false,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg.startsWith('--format=')) {
      parsed.format = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      parsed.output = arg.split('=')[1];
    } else if (arg.startsWith('--whitelist=')) {
      parsed.whitelist = arg.split('=')[1].split(',').map(s => s.trim());
    } else if (arg.startsWith('--exclude=')) {
      parsed.exclude = arg.split('=')[1].split(',').map(s => s.trim());
    } else if (arg.startsWith('--prefix=')) {
      parsed.prefix = arg.split('=')[1];
    } else if (arg.startsWith('--redact=')) {
      parsed.redact = arg.split('=')[1].split(',').map(s => s.trim());
    } else if (arg === '--generate-example') {
      parsed.generateExample = true;
    } else if (!arg.startsWith('--') && !parsed.file) {
      parsed.file = arg;
    } else if (!arg.startsWith('--')) {
      parsed.file = arg;
    }
  }
  
  return parsed;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
env-to-json - Convert .env files to JSON/YAML

Usage:
  env-to-json [file] [options]

Options:
  --format=json|yaml|js     Output format (default: json)
  --output=filename         Save to file instead of stdout
  --whitelist=KEY1,KEY2     Only include these keys
  --exclude=KEY1,KEY2       Exclude these keys
  --prefix=PREFIX_          Only keys starting with prefix
  --redact=PASS,SECRET      Redact sensitive keys/values
  --generate-example        Generate .env.example file
  --help, -h               Show this help

Examples:
  env-to-json                              # Convert .env to JSON
  env-to-json .env.local --format=yaml     # Convert to YAML
  env-to-json --whitelist=PORT,DB_HOST     # Filter specific keys
  env-to-json --exclude=SECRET --output=config.json
  env-to-json --prefix=REACT_APP_ --format=yaml
  env-to-json --redact=PASSWORD,TOKEN --format=json
  env-to-json --generate-example
`);
}

module.exports = {
  readFile,
  writeFile,
  fileExists,
  maskSecrets,
  parseArgs,
  showHelp
};