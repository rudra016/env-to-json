# env-to-json

A lightweight CLI tool and Node.js module that converts `.env` files into clean, optionally filtered JSON or YAML formats. Perfect for scripting, CI/CD pipelines, Docker configurations, or generating config files from environment variables.

## 🚀 Features

- **Multiple Output Formats**: JSON (default), YAML, or JavaScript modules
- **Smart Filtering**: Whitelist, exclude, or prefix-based filtering
- **Secret Redaction**: Automatically mask sensitive values
- **Example Generation**: Create `.env.example` files from existing `.env` files
- **Flexible Output**: Write to files or stdout
- **Robust Parsing**: Handles quotes, comments, multiline values, and escaped characters
- **Zero Dependencies**: Only requires `js-yaml` for YAML support

## 📦 Installation

```bash
# Install globally
npm install -g env-to-json

# Or use with npx (no installation required)
npx env-to-json
```

## 🖥️ CLI Usage

### Basic Usage

```bash
# Convert .env to JSON (default)
env-to-json

# Convert specific file
env-to-json .env.production

# Output to stdout
env-to-json .env > config.json
```

### Output Formats

```bash
# JSON (default)
env-to-json --format=json

# YAML
env-to-json --format=yaml

# JavaScript module
env-to-json --format=js
```

### Filtering Options

```bash
# Only include specific keys
env-to-json --whitelist=PORT,DB_HOST,API_URL

# Exclude sensitive keys
env-to-json --exclude=DB_PASSWORD,JWT_SECRET

# Filter by prefix (great for React apps)
env-to-json --prefix=REACT_APP_

# Combine filters
env-to-json --prefix=API_ --exclude=API_SECRET
```

### Secret Redaction

```bash
# Redact keys containing sensitive terms
env-to-json --redact=PASSWORD,SECRET,TOKEN,KEY

# Redact specific patterns
env-to-json --redact=PRIVATE,CREDENTIAL
```

### File Output

```bash
# Save to file
env-to-json --output=config.json

# Generate YAML config
env-to-json --format=yaml --output=config.yml

# Create filtered config
env-to-json --prefix=APP_ --output=app-config.json
```

### Generate Example Files

```bash
# Create .env.example from .env
env-to-json --generate-example

# Create example from specific file
env-to-json .env.production --generate-example
```

## 📚 Node.js API

### Basic Usage

```javascript
const { convertEnv, loadEnv } = require('env-to-json');

// Convert .env file
const result = convertEnv({
  file: '.env',
  format: 'json'
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}

// Load environment variables as object
const env = loadEnv('.env');
console.log(env.DB_HOST);
```

### Advanced Usage

```javascript
const { convertEnv } = require('env-to-json');

// Convert with all options
const result = convertEnv({
  file: '.env.production',
  format: 'yaml',
  output: 'config.yml',
  whitelist: ['DB_HOST', 'DB_PORT', 'API_URL'],
  exclude: ['DB_PASSWORD'],
  prefix: 'APP_',
  redact: ['SECRET', 'TOKEN', 'KEY'],
  generateExample: false
});

if (result.success) {
  console.log(`✅ ${result.message}`);
} else {
  console.error(`❌ ${result.error}`);
}
```

### API Reference

#### `convertEnv(options)`

Converts .env file to specified format with filtering options.

**Parameters:**
- `options` (Object):
  - `file` (string): Path to .env file (default: '.env')
  - `format` (string): Output format - 'json', 'yaml', or 'js' (default: 'json')
  - `output` (string): Output file path (default: null, outputs to stdout)
  - `whitelist` (Array): Keys to include (default: [])
  - `exclude` (Array): Keys to exclude (default: [])
  - `prefix` (string): Only include keys starting with prefix (default: null)
  - `redact` (Array): Redact keys/values containing these terms (default: [])
  - `generateExample` (boolean): Generate .env.example file (default: false)

**Returns:**
- Object with `success` (boolean), `data` (string), `error` (string), and `message` (string)

#### `loadEnv(filePath)`

Loads and parses .env file into a JavaScript object.

**Parameters:**
- `filePath` (string): Path to .env file (default: '.env')

**Returns:**
- Object with parsed environment variables

## 🔧 Advanced Examples

### Docker Configuration

```bash
# Generate Docker-friendly JSON config
env-to-json --exclude=DEV_,TEST_ --format=json --output=docker-config.json

# Create production config
env-to-json .env.production --redact=SECRET,PASSWORD --output=prod-config.json
```

### CI/CD Pipeline

```bash
# Extract only deployment variables
env-to-json --prefix=DEPLOY_ --format=yaml --output=deployment.yml

# Create sanitized config for logging
env-to-json --redact=SECRET,TOKEN,PASSWORD,KEY --format=json
```

### Frontend Build Process

```bash
# Extract React environment variables
env-to-json --prefix=REACT_APP_ --format=js --output=src/config.js

# Generate Vite config
env-to-json --prefix=VITE_ --format=json --output=vite-env.json
```

### Development Workflow

```bash
# Create team-shareable example file
env-to-json --generate-example

# Create development config without secrets
env-to-json --exclude=PROD_,SECRET_,TOKEN_ --output=dev-config.json
```

## 📝 .env File Format Support

The tool supports standard .env file format with these features:

```bash
# Comments are ignored
# DATABASE_URL=ignored

# Basic key-value pairs
DB_HOST=localhost
DB_PORT=5432

# Empty values
OPTIONAL_SETTING=

# Quoted values (quotes are removed)
APP_NAME="My Awesome App"
DESCRIPTION='Single quoted value'

# Values with spaces
FULL_NAME="John Doe"

# Escaped characters
MULTILINE="Line 1\nLine 2\nLine 3"
JSON_CONFIG='{"key": "value", "number": 42}'

# URLs and special characters
API_URL=https://api.example.com/v1
WEBHOOK_URL="https://hooks.example.com/webhook?token=abc123"
```

## 🛡️ Security Features

### Secret Redaction

The `--redact` option automatically masks values containing sensitive terms:

```bash
# Before redaction
API_KEY=abc123def456
DB_PASSWORD=super_secret
USER_TOKEN=xyz789

# After --redact=KEY,PASSWORD,TOKEN
API_KEY=***REDACTED***
DB_PASSWORD=***REDACTED***
USER_TOKEN=***REDACTED***
```

### Filtering Best Practices

```bash
# Production deployment - exclude all development keys
env-to-json --exclude=DEV_,TEST_,DEBUG_ --redact=SECRET,TOKEN

# Frontend build - only include public variables
env-to-json --prefix=REACT_APP_ --exclude=REACT_APP_SECRET

# CI/CD - whitelist only required variables
env-to-json --whitelist=API_URL,DB_HOST,REDIS_URL --redact=PASSWORD,KEY
```

## 🧪 Testing

```bash
# Run tests
npm test

# Test with sample file
env-to-json test/sample.env --format=json
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [dotenv](https://github.com/motdotla/dotenv) - Load environment variables from .env file
- [cross-env](https://github.com/kentcdodds/cross-env) - Run scripts with environment variables
- [env-cmd](https://github.com/toddbluhm/env-cmd) - Execute commands using environment variables

---

Made with ❤️ for developers who love clean configuration management.