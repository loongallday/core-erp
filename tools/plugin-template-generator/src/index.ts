#!/usr/bin/env node

/**
 * Core ERP Plugin Template Generator - CLI Entry Point
 * 
 * This is the main entry point for the plugin template generator CLI tool.
 * It orchestrates the entire generation process:
 * 1. Display welcome message
 * 2. Collect user inputs via prompts
 * 3. Generate plugin files
 * 4. Display success message with next steps
 * 
 * Usage:
 *   npm run generate-plugin
 *   or
 *   npx @core-erp/plugin-template-generator
 */

import chalk from 'chalk'
import { promptForConfig } from './prompts.js'
import { generatePlugin } from './generator.js'

/**
 * Main CLI function
 * Handles the entire plugin generation workflow
 */
async function main(): Promise<void> {
  try {
    // Display banner
    console.log('\n' + chalk.bold.cyan('╔════════════════════════════════════════════════════════════╗'))
    console.log(chalk.bold.cyan('║') + chalk.bold.white('    Core ERP Plugin Template Generator v1.0.0              ') + chalk.bold.cyan('║'))
    console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝') + '\n')
    
    // Step 1: Collect configuration from user
    const config = await promptForConfig()
    
    // Step 2: Generate plugin
    console.log('\n' + chalk.cyan('🚀 Generating plugin...') + '\n')
    const result = await generatePlugin(config)
    
    // Step 3: Display results
    if (result.success) {
      console.log('\n' + chalk.green.bold('✅ Plugin generated successfully!') + '\n')
      console.log(chalk.bold('📁 Location:'), chalk.cyan(result.pluginPath))
      console.log(chalk.bold('📄 Files:'), chalk.cyan(result.filesGenerated.toString()))
      
      // Display next steps
      console.log('\n' + chalk.yellow.bold('📌 Next Steps:') + '\n')
      console.log(chalk.white('1. Navigate to your plugin:'))
      console.log(chalk.cyan(`   cd ${result.pluginPath}`))
      console.log()
      console.log(chalk.white('2. Install dependencies:'))
      console.log(chalk.cyan('   npm install'))
      console.log()
      console.log(chalk.white('3. Build the plugin:'))
      console.log(chalk.cyan('   npm run build'))
      console.log()
      console.log(chalk.white('4. Install in Core ERP:'))
      console.log(chalk.cyan(`   cd <core-erp-directory>`))
      console.log(chalk.cyan(`   npm install ${result.pluginPath}`))
      console.log()
      console.log(chalk.white('5. Configure in plugins.config.ts:'))
      console.log(chalk.cyan('   Add your plugin configuration'))
      console.log()
      console.log(chalk.white('6. Start Core ERP:'))
      console.log(chalk.cyan('   npm run dev'))
      console.log()
      console.log(chalk.gray('📖 For more information, see the generated README.md'))
      console.log(chalk.gray('📚 Documentation: docs/plugins/PLUGIN_DEVELOPMENT_GUIDE.md'))
      console.log()
    } else {
      console.log('\n' + chalk.red.bold('❌ Plugin generation failed!') + '\n')
      
      if (result.errors.length > 0) {
        console.log(chalk.red('Errors:'))
        result.errors.forEach(error => {
          console.log(chalk.red(`  - ${error}`))
        })
        console.log()
      }
      
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\n' + chalk.red.bold('❌ An unexpected error occurred:') + '\n')
    console.error(chalk.red(error instanceof Error ? error.message : String(error)))
    console.error()
    
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray('Stack trace:'))
      console.error(chalk.gray(error.stack))
    }
    
    process.exit(1)
  }
}

// Run the CLI
main()

