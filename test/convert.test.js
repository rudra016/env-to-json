const { convertEnv, parseEnv, formatOutput, generateExample } = require('../src/index');
const { applyFilters } = require('../src/filters');
const { maskSecrets, fileExists } = require('../src/utils');
const fs = require('fs');
const path = require('path');

// Test utilities
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function runTests() {
  console.log('🧪 Running env-to-json tests...\n');
  
  // Test 1: Parse basic .env content
  testParseEnv();
  
  // Test 2: Apply filters
  testFilters();
  
  // Test 3: Mask secrets
  testMaskSecrets();
  
  // Test 4: Format output
  testFormatOutput();
  
  // Test 5: Generate example file
  testGenerateExample();
  
  // Test 6: Full conversion with sample file
  testFullConversion();
  
  console.log('\n🎉 All tests passed!');
}

function testParseEnv() {
  console.log('📋 Testing parseEnv...');
  
  const envContent = `
# Comment
DB_HOST=localhost
DB_PORT=5432
EMPTY_VALUE=
QUOTED_VALUE="hello world"
SINGLE_QUOTED='single quotes'
ESCAPED_NEWLINE="line1\\nline2"
# Another comment
API_KEY=abc123
  `;
  
  const parsed = parseEnv(envContent);
  
  assert(parsed.DB_HOST === 'localhost', 'Should parse DB_HOST');
  assert(parsed.DB_PORT === '5432', 'Should parse DB_PORT');
  assert(parsed.EMPTY_VALUE === '', 'Should handle empty values');
  assert(parsed.QUOTED_VALUE === 'hello world', 'Should remove quotes');
  assert(parsed.SINGLE_QUOTED === 'single quotes', 'Should handle single quotes');
  assert(parsed.ESCAPED_NEWLINE === 'line1\nline2', 'Should handle escaped newlines');
  assert(parsed.API_KEY === 'abc123', 'Should parse API_KEY');
  assert(!parsed.hasOwnProperty('Comment'), 'Should ignore comments');
}

function testFilters() {
  console.log('📋 Testing filters...');
  
  const env = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    API_KEY: 'secret',
    REACT_APP_VERSION: '1.0.0',
    REACT_APP_TITLE: 'My App',
    FEATURE_FLAG: 'true'
  };
  
  // Test whitelist
  const whitelisted = applyFilters(env, { whitelist: ['DB_HOST', 'API_KEY'] });
  assert(Object.keys(whitelisted).length === 2, 'Whitelist should filter to 2 keys');
  assert(whitelisted.DB_HOST === 'localhost', 'Should include whitelisted key');
  
  // Test exclude
  const excluded = applyFilters(env, { exclude: ['API_KEY'] });
  assert(!excluded.hasOwnProperty('API_KEY'), 'Should exclude specified key');
  assert(excluded.DB_HOST === 'localhost', 'Should keep non-excluded keys');
  
  // Test prefix
  const prefixed = applyFilters(env, { prefix: 'REACT_APP_' });
  assert(Object.keys(prefixed).length === 2, 'Prefix should filter to 2 keys');
  assert(prefixed.REACT_APP_VERSION === '1.0.0', 'Should include prefixed key');
}

function testMaskSecrets() {
  console.log('📋 Testing maskSecrets...');
  
  const env = {
    DB_HOST: 'localhost',
    DB_PASSWORD: 'secret123',
    API_KEY: 'abc123',
    PUBLIC_URL: 'https://example.com'
  };
  
  const masked = maskSecrets(env, ['PASSWORD', 'KEY']);
  
  assert(masked.DB_HOST === 'localhost', 'Should not mask non-sensitive keys');
  assert(masked.DB_PASSWORD === '***REDACTED***', 'Should mask password');
  assert(masked.API_KEY === '***REDACTED***', 'Should mask API key');
  assert(masked.PUBLIC_URL === 'https://example.com', 'Should not mask public URL');
}

function testFormatOutput() {
  console.log('📋 Testing formatOutput...');
  
  const obj = { key: 'value', number: 42 };
  
  // Test JSON
  const json = formatOutput(obj, 'json');
  assert(json.includes('"key": "value"'), 'Should format as JSON');
  
  // Test YAML
  const yaml = formatOutput(obj, 'yaml');
  assert(yaml.includes('key: value'), 'Should format as YAML');
  
  // Test JS
  const js = formatOutput(obj, 'js');
  assert(js.startsWith('module.exports = '), 'Should format as JS module');
}

function testGenerateExample() {
  console.log('📋 Testing generateExample...');
  
  const env = {
    DB_HOST: 'localhost',
    API_KEY: 'secret',
    PORT: '3000'
  };
  
  const example = generateExample(env);
  const lines = example.trim().split('\n');
  
  assert(lines.length === 3, 'Should generate 3 lines');
  assert(lines.includes('API_KEY='), 'Should include API_KEY with empty value');
  assert(lines.includes('DB_HOST='), 'Should include DB_HOST with empty value');
  assert(lines.includes('PORT='), 'Should include PORT with empty value');
}

function testFullConversion() {
  console.log('📋 Testing full conversion...');
  
  const sampleFile = path.join(__dirname, 'sample.env');
  
  if (!fileExists(sampleFile)) {
    console.log('⚠️  Skipping full conversion test - sample.env not found');
    return;
  }
  
  // Test basic conversion
  const result1 = convertEnv({ file: sampleFile });
  assert(result1.success, 'Should successfully convert sample.env');
  assert(result1.data.includes('"DB_HOST"'), 'Should include DB_HOST in output');
  
  // Test with filters
  const result2 = convertEnv({ 
    file: sampleFile, 
    prefix: 'REACT_APP_',
    format: 'yaml'
  });
  assert(result2.success, 'Should successfully convert with prefix filter');
  assert(result2.data.includes('REACT_APP_'), 'Should include React app variables');
  
  // Test with redaction
  const result3 = convertEnv({ 
    file: sampleFile, 
    redact: ['PASSWORD', 'SECRET', 'KEY']
  });
  assert(result3.success, 'Should successfully convert with redaction');
  assert(result3.data.includes('***REDACTED***'), 'Should redact sensitive values');
  
  // Test example generation
  const result4 = convertEnv({ 
    file: sampleFile, 
    generateExample: true 
  });
  assert(result4.success, 'Should successfully generate example');
  
  // Clean up generated example file
  const exampleFile = path.join(__dirname, 'sample.env.example');
  if (fileExists(exampleFile)) {
    fs.unlinkSync(exampleFile);
  }
}

// Run the tests
runTests();