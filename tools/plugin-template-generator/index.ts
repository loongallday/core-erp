#!/usr/bin/env node

/**
 * Plugin Template Generator - CLI Entry Point
 * 
 * This is the main entry point for the plugin template generator CLI tool.
 * It orchestrates the entire generation process from prompts to file creation.
 * 
 * USAGE:
 * ------
 * From the core-erp project root:
 *   npm run generate-plugin
 * 
 * Or directly:
 *   cd tools/plugin-template-generator && npm start
 * 
 * FLOW:
 * -----
 * 1. Display welcome message
 * 2. Run interactive prompts
 * 3. Process answers into metadata
 * 4. Generate plugin files
 * 5. Display summary and next steps
 */

import chalk from 'chalk'
import { runPrompts } from './prompts.js'
import { generatePlugin, processMetadata, displaySummary } from './generator.js'

/**
 * Main CLI function
 * 
 * This is the entry point that runs when the CLI is invoked.
 * It handles the entire generation workflow and error handling.
 */
async function main() {
  try {
    // Run interactive prompts
    const answers = await runPrompts()
    
    // Generate the plugin
    console.log() // Add spacing
    const result = await generatePlugin(answers)
    
    // Process metadata for summary
    const meta = processMetadata(answers)
    
    // Display summary and next steps
    displaySummary(result, meta)
    
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1)
  } catch (error) {
    // Handle unexpected errors
    console.error(chalk.red.bold('\n❌ An unexpected error occurred:\n'))
    console.error(chalk.red(error instanceof Error ? error.message : String(error)))
    
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray('\nStack trace:'))
      console.error(chalk.gray(error.stack))
    }
    
    process.exit(1)
  }
}

// Run the CLI
main()

