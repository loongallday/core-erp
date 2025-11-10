/**
 * Interactive Prompts for Plugin Template Generator
 * 
 * This module handles all user interaction through the CLI,
 * gathering information needed to generate a plugin.
 */

import inquirer from 'inquirer'
import { PromptAnswers, PluginCategory } from './types.js'
import { validatePluginName, validateDirectory, kebabCase } from './utils.js'
import chalk from 'chalk'

/**
 * Runs the interactive prompt sequence to gather plugin configuration
 * 
 * This function guides the user through a series of questions to collect
 * all necessary information for generating a plugin template.
 * 
 * @example
 * const answers = await runPrompts()
 * // User is prompted for name, category, features, etc.
 * console.log(answers.pluginName) // "Inventory Management"
 * 
 * @returns Promise resolving to user's answers
 */
export async function runPrompts(): Promise<PromptAnswers> {
  console.log(chalk.blue.bold('\n🚀 Core ERP Plugin Template Generator\n'))
  console.log(chalk.gray('This wizard will help you create a new plugin for Core ERP.\n'))
  
  const answers = await inquirer.prompt<PromptAnswers>([
    // -------------------------------------------------------------------------
    // Plugin Name
    // -------------------------------------------------------------------------
    {
      type: 'input',
      name: 'pluginName',
      message: 'What is your plugin name?',
      default: 'My Plugin',
      validate: (input: string) => {
        const result = validatePluginName(input)
        return result.valid || result.error || 'Invalid plugin name'
      },
      transformer: (input: string) => {
        // Show what the package name will be
        const id = kebabCase(input)
        return `${input} ${chalk.gray(`(→ @core-erp/plugin-${id})`)}`
      },
    },
    
    // -------------------------------------------------------------------------
    // Plugin Category
    // -------------------------------------------------------------------------
    {
      type: 'list',
      name: 'category',
      message: 'What category does your plugin belong to?',
      choices: [
        {
          name: 'Operations - Inventory, Manufacturing, Warehouse',
          value: 'operations' as PluginCategory,
        },
        {
          name: 'Sales - CRM, Sales, Orders',
          value: 'sales' as PluginCategory,
        },
        {
          name: 'Finance - Accounting, Invoicing, Payments',
          value: 'finance' as PluginCategory,
        },
        {
          name: 'HR - Human Resources, Payroll',
          value: 'hr' as PluginCategory,
        },
        {
          name: 'Analytics - Reports, Dashboards, BI',
          value: 'analytics' as PluginCategory,
        },
        {
          name: 'Integration - Third-party integrations',
          value: 'integration' as PluginCategory,
        },
        {
          name: 'Utility - Tools and utilities',
          value: 'utility' as PluginCategory,
        },
        {
          name: 'Custom - Custom category',
          value: 'custom' as PluginCategory,
        },
      ],
      default: 'operations',
    },
    
    // -------------------------------------------------------------------------
    // Description
    // -------------------------------------------------------------------------
    {
      type: 'input',
      name: 'description',
      message: 'Enter a brief description:',
      default: (answers: Partial<PromptAnswers>) => 
        `${answers.pluginName} plugin for Core ERP`,
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Description is required'
        }
        if (input.length > 200) {
          return 'Description must be less than 200 characters'
        }
        return true
      },
    },
    
    // -------------------------------------------------------------------------
    // Author
    // -------------------------------------------------------------------------
    {
      type: 'input',
      name: 'author',
      message: 'Who is the author?',
      default: 'Your Company',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Author is required'
        }
        return true
      },
    },
    
    // -------------------------------------------------------------------------
    // Output Directory
    // -------------------------------------------------------------------------
    {
      type: 'input',
      name: 'outputDirectory',
      message: 'Where should the plugin be generated?',
      default: (answers: Partial<PromptAnswers>) => {
        const id = kebabCase(answers.pluginName || 'my-plugin')
        return `../plugin-${id}`
      },
      validate: (input: string) => {
        const result = validateDirectory(input)
        return result.valid || result.error || 'Invalid directory'
      },
    },
    
    // -------------------------------------------------------------------------
    // Feature Selection
    // -------------------------------------------------------------------------
    {
      type: 'checkbox',
      name: 'features',
      message: 'What features should be included? (Select with Space, confirm with Enter)',
      choices: [
        {
          name: 'Frontend Routes & Pages (React components with CRUD)',
          value: 'frontend',
          checked: true,
        },
        {
          name: 'Menu Items (Sidebar navigation)',
          value: 'menu',
          checked: true,
        },
        {
          name: 'Dashboard Widgets (Dashboard components)',
          value: 'widgets',
          checked: false,
        },
        {
          name: 'Backend Edge Functions (Supabase serverless functions)',
          value: 'backend',
          checked: true,
        },
        {
          name: 'Database Migrations (SQL schema and RLS policies)',
          value: 'database',
          checked: true,
        },
        {
          name: 'Permissions (Access control definitions)',
          value: 'permissions',
          checked: true,
        },
        {
          name: 'Translations (i18n support for EN and TH)',
          value: 'translations',
          checked: true,
        },
        {
          name: 'Event Handlers (Inter-plugin communication)',
          value: 'events',
          checked: false,
        },
      ],
      validate: (choices: string[]) => {
        if (choices.length === 0) {
          return 'Please select at least one feature'
        }
        return true
      },
    },
    
    // -------------------------------------------------------------------------
    // Resource Name (for CRUD example)
    // -------------------------------------------------------------------------
    {
      type: 'input',
      name: 'resourceName',
      message: 'What is the name of your main resource? (singular, e.g., "Item", "Product")',
      default: 'Item',
      when: (answers: Partial<PromptAnswers>) => {
        // Only ask if frontend or backend is selected
        return answers.features?.includes('frontend') || answers.features?.includes('backend')
      },
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Resource name is required'
        }
        if (!/^[A-Za-z]+$/.test(input)) {
          return 'Resource name should contain only letters'
        }
        if (input.length < 2) {
          return 'Resource name must be at least 2 characters'
        }
        return true
      },
      transformer: (input: string) => {
        // Capitalize first letter
        const formatted = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()
        return formatted
      },
    },
  ])
  
  // Ensure resourceName is set even if not prompted
  if (!answers.resourceName) {
    answers.resourceName = 'Item'
  }
  
  // Show summary
  console.log(chalk.green('\n✓ Configuration complete!\n'))
  console.log(chalk.gray('Summary:'))
  console.log(chalk.gray(`  Plugin: ${answers.pluginName}`))
  console.log(chalk.gray(`  Package: @core-erp/plugin-${kebabCase(answers.pluginName)}`))
  console.log(chalk.gray(`  Category: ${answers.category}`))
  console.log(chalk.gray(`  Features: ${answers.features.join(', ')}`))
  console.log(chalk.gray(`  Resource: ${answers.resourceName}`))
  console.log(chalk.gray(`  Output: ${answers.outputDirectory}\n`))
  
  // Confirm before proceeding
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Generate plugin with this configuration?',
      default: true,
    },
  ])
  
  if (!proceed) {
    console.log(chalk.yellow('\n✗ Plugin generation cancelled.\n'))
    process.exit(0)
  }
  
  return answers
}

