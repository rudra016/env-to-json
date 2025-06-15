#!/usr/bin/env node

const { convertEnv } = require('../src/index');
const { parseArgs, showHelp } = require('../src/utils');

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  // Show help if requested
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  // Validate format
  const validFormats = ['json', 'yaml', 'js'];
  if (!validFormats.includes(options.format)) {
    console.error(`Error: Invalid format '${options.format}'. Valid formats: ${validFormats.join(', ')}`);
    process.exit(1);
  }
  
  // Convert the environment file
  const result = convertEnv(options);
  
  if (!result.success) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
  
  // Output results
  if (result.message) {
    console.log(result.message);
  }
  
  if (result.data && !options.output && !options.generateExample) {
    console.log(result.data);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the CLI
main();