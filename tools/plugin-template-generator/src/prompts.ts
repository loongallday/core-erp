/**
 * Core ERP Plugin Template Generator - Interactive Prompts
 * 
 * This module handles all user interactions through inquirer prompts.
 * It collects plugin configuration, validates inputs, and returns
 * a complete PluginConfig object ready for generation.
 */

import inquirer from 'inquirer'
import path from 'path'
import fs from 'fs-extra'
import {
  validatePluginName,
  validateResourceName,
  validateOutputDir,
  toKebabCase,
  toPascalCase,
} from './utils.js'
import { PluginConfig, PluginCategory, PluginFeatures } from './types.js'

/**
 * Runs the interactive prompt sequence to gather plugin configuration
 * 
 * This function orchestrates the entire prompt flow:
 * 1. Basic metadata (name, description, author)
 * 2. Category selection
 * 3. Output directory
 * 4. Feature selection
 * 5. Resource name (if frontend/backend selected)
 * 
 * @returns Complete plugin configuration from user inputs
 */
export async function promptForConfig(): Promise<PluginConfig> {
  console.log('\n🎨 Core ERP Plugin Template Generator\n')
  console.log('This tool will help you create a new plugin with working CRUD examples.\n')
  
  // Step 1: Basic Information
  const basicAnswers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Plugin name (e.g., "Inventory Management"):',
      validate: (input: string) => {
        const result = validatePluginName(input)
        return result.valid || result.error || 'Invalid plugin name'
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Plugin description:',
      default: (answers: any) => `${answers.name} plugin for Core ERP`,
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: 'Your Company',
    },
  ])
  
  // Step 2: Category Selection
  const categoryAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Plugin category:',
      choices: [
        { name: 'Operations (Inventory, Manufacturing, Warehouse)', value: 'operations' },
        { name: 'Sales (CRM, Sales, Orders)', value: 'sales' },
        { name: 'Finance (Accounting, Invoicing, Payments)', value: 'finance' },
        { name: 'HR (Human Resources, Payroll)', value: 'hr' },
        { name: 'Analytics (Reports, Dashboards, BI)', value: 'analytics' },
        { name: 'Integration (Third-party integrations)', value: 'integration' },
        { name: 'Utility (Tools and utilities)', value: 'utility' },
        { name: 'Custom', value: 'custom' },
      ],
    },
  ])
  
  // Step 3: Output Directory
  const outputAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory (where to create the plugin):',
      default: process.cwd(),
      validate: async (input: string) => {
        const result = validateOutputDir(input)
        if (!result.valid) {
          return result.error || 'Invalid output directory'
        }
        
        // Check if path is accessible
        try {
          await fs.access(path.dirname(input))
          return true
        } catch {
          return 'Directory is not accessible. Please check the path.'
        }
      },
    },
  ])
  
  // Step 4: Feature Selection
  console.log('\n📦 Select features to include in your plugin:\n')
  
  const featureAnswers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Which features do you want to include?',
      choices: [
        { name: 'Frontend (Routes + Pages)', value: 'frontend', checked: true },
        { name: 'Menu Items', value: 'menu', checked: true },
        { name: 'Dashboard Widgets', value: 'widgets', checked: false },
        { name: 'Backend (Edge Functions)', value: 'backend', checked: true },
        { name: 'Database (Migrations)', value: 'database', checked: true },
        { name: 'Permissions', value: 'permissions', checked: true },
        { name: 'Translations (en + th)', value: 'translations', checked: true },
        { name: 'Event Handlers', value: 'events', checked: false },
      ],
      validate: (input: string[]) => {
        if (input.length === 0) {
          return 'Please select at least one feature'
        }
        return true
      },
    },
  ])
  
  // Convert feature array to PluginFeatures object
  const features: PluginFeatures = {
    frontend: featureAnswers.features.includes('frontend'),
    menu: featureAnswers.features.includes('menu'),
    widgets: featureAnswers.features.includes('widgets'),
    backend: featureAnswers.features.includes('backend'),
    database: featureAnswers.features.includes('database'),
    permissions: featureAnswers.features.includes('permissions'),
    translations: featureAnswers.features.includes('translations'),
    events: featureAnswers.features.includes('events'),
  }
  
  // Step 5: Resource Name (if frontend or backend selected)
  let resourceName = 'Item' // Default
  
  if (features.frontend || features.backend || features.database) {
    console.log('\n🔧 CRUD Example Configuration:\n')
    console.log('The generator will create a working CRUD example for a resource.')
    console.log('For example, "Item" will generate ItemList, ItemForm, etc.\n')
    
    const resourceAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'resourceName',
        message: 'Resource name for CRUD example (e.g., "Product", "Customer"):',
        default: 'Item',
        validate: (input: string) => {
          const result = validateResourceName(input)
          return result.valid || result.error || 'Invalid resource name'
        },
      },
    ])
    
    resourceName = toPascalCase(resourceAnswer.resourceName)
  }
  
  // Build complete config
  const pluginId = toKebabCase(basicAnswers.name)
  
  const config: PluginConfig = {
    name: basicAnswers.name.trim(),
    id: pluginId,
    description: basicAnswers.description.trim(),
    author: basicAnswers.author.trim(),
    category: categoryAnswer.category as PluginCategory,
    outputDir: path.resolve(outputAnswer.outputDir.trim()),
    resourceName: resourceName,
    features: features,
  }
  
  // Show summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 Plugin Configuration Summary')
  console.log('='.repeat(60))
  console.log(`Name:         ${config.name}`)
  console.log(`ID:           ${config.id}`)
  console.log(`Category:     ${config.category}`)
  console.log(`Description:  ${config.description}`)
  console.log(`Author:       ${config.author}`)
  console.log(`Output:       ${config.outputDir}`)
  console.log(`Resource:     ${config.resourceName}`)
  console.log('\nFeatures:')
  console.log(`  - Frontend:     ${features.frontend ? '✓' : '✗'}`)
  console.log(`  - Menu:         ${features.menu ? '✓' : '✗'}`)
  console.log(`  - Widgets:      ${features.widgets ? '✓' : '✗'}`)
  console.log(`  - Backend:      ${features.backend ? '✓' : '✗'}`)
  console.log(`  - Database:     ${features.database ? '✓' : '✗'}`)
  console.log(`  - Permissions:  ${features.permissions ? '✓' : '✗'}`)
  console.log(`  - Translations: ${features.translations ? '✓' : '✗'}`)
  console.log(`  - Events:       ${features.events ? '✓' : '✗'}`)
  console.log('='.repeat(60) + '\n')
  
  // Confirm
  const confirmAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with plugin generation?',
      default: true,
    },
  ])
  
  if (!confirmAnswer.proceed) {
    console.log('\n❌ Plugin generation cancelled.\n')
    process.exit(0)
  }
  
  return config
}

