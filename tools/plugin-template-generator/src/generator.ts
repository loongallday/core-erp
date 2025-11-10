/**
 * Core ERP Plugin Template Generator - Core Generation Logic
 * 
 * This module contains the main generation logic that orchestrates
 * the entire plugin creation process. It creates the directory structure,
 * generates files from templates, and handles the complete workflow.
 */

import path from 'path'
import fs from 'fs-extra'
import ora from 'ora'
import chalk from 'chalk'
import { PluginConfig, TemplateContext, GenerationResult } from './types.js'
import { generateAllFiles } from './fileGenerator.js'
import {
  toCamelCase,
  toPascalCase,
  toPlural,
  createPackageName,
  getCurrentYear,
  getCurrentDate,
} from './utils.js'

/**
 * Generates a complete plugin package from the provided configuration
 * 
 * This is the main function that orchestrates the entire generation process:
 * 1. Creates template context with all interpolation variables
 * 2. Generates all files based on selected features
 * 3. Creates directory structure
 * 4. Writes all files to disk
 * 5. Returns generation result
 * 
 * @param config - Complete plugin configuration from prompts
 * @returns Generation result with success status and metadata
 */
export async function generatePlugin(config: PluginConfig): Promise<GenerationResult> {
  const errors: string[] = []
  let filesGenerated = 0
  
  // Create spinner for progress indication
  const spinner = ora()
  
  try {
    // Step 1: Create template context
    spinner.start('Creating template context...')
    const context = createTemplateContext(config)
    spinner.succeed(chalk.green('Template context created'))
    
    // Step 2: Generate all file contents
    spinner.start('Generating file contents...')
    const files = generateAllFiles(context)
    spinner.succeed(chalk.green(`Generated ${files.length} files`))
    
    // Step 3: Create plugin directory
    const pluginDir = path.join(config.outputDir, `plugin-${config.id}`)
    
    spinner.start(`Creating plugin directory: ${pluginDir}`)
    
    // Check if directory already exists
    if (await fs.pathExists(pluginDir)) {
      spinner.fail(chalk.red('Plugin directory already exists'))
      errors.push(`Directory already exists: ${pluginDir}`)
      errors.push('Please choose a different output directory or remove the existing directory')
      
      return {
        success: false,
        pluginPath: pluginDir,
        filesGenerated: 0,
        errors,
      }
    }
    
    // Create directory
    await fs.ensureDir(pluginDir)
    spinner.succeed(chalk.green('Plugin directory created'))
    
    // Step 4: Write all files
    spinner.start('Writing files...')
    
    for (const file of files) {
      const filePath = path.join(pluginDir, file.path)
      
      try {
        // Ensure parent directory exists
        await fs.ensureDir(path.dirname(filePath))
        
        // Write file
        await fs.writeFile(filePath, file.content, 'utf-8')
        filesGenerated++
        
        // Update spinner text to show progress
        spinner.text = chalk.cyan(`Writing files... (${filesGenerated}/${files.length})`)
        
      } catch (error) {
        const errorMsg = `Failed to write file ${file.path}: ${error instanceof Error ? error.message : String(error)}`
        errors.push(errorMsg)
        console.error(chalk.red(`\n  ✗ ${errorMsg}`))
      }
    }
    
    spinner.succeed(chalk.green(`Wrote ${filesGenerated} files`))
    
    // Step 5: Success
    return {
      success: errors.length === 0,
      pluginPath: pluginDir,
      filesGenerated,
      errors,
    }
    
  } catch (error) {
    spinner.fail(chalk.red('Generation failed'))
    
    const errorMsg = error instanceof Error ? error.message : String(error)
    errors.push(errorMsg)
    
    return {
      success: false,
      pluginPath: path.join(config.outputDir, `plugin-${config.id}`),
      filesGenerated,
      errors,
    }
  }
}

/**
 * Creates a template context with all interpolation variables
 * 
 * This function takes the plugin configuration and generates all the
 * variables needed for string interpolation in templates. It handles
 * various naming conventions and formats.
 * 
 * @param config - Plugin configuration
 * @returns Complete template context ready for interpolation
 */
export function createTemplateContext(config: PluginConfig): TemplateContext {
  const pluginId = config.id
  const resourceName = config.resourceName
  
  return {
    // Plugin identifiers (various formats)
    pluginName: config.name,
    pluginId: pluginId,
    pluginIdCamel: toCamelCase(pluginId),
    pluginIdPascal: toPascalCase(pluginId),
    packageName: createPackageName(pluginId),
    
    // Resource names (for CRUD examples)
    resourceName: resourceName,
    resourceNamePlural: toPlural(resourceName),
    resourceNameLower: resourceName.toLowerCase(),
    resourceNameLowerPlural: toPlural(resourceName.toLowerCase()),
    resourceNameCamel: toCamelCase(resourceName),
    resourceNamePascal: toPascalCase(resourceName),
    
    // Metadata
    description: config.description,
    author: config.author,
    category: config.category,
    year: getCurrentYear(),
    date: getCurrentDate(),
    
    // Feature flags
    features: config.features,
  }
}

