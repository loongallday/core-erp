/**
 * Core Generation Logic for Plugin Template Generator
 * 
 * This module orchestrates the plugin generation process, creating the directory
 * structure and coordinating file generation from templates.
 */

import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { PromptAnswers, PluginMetadata, GenerationResult, PluginFeatures } from './types.js'
import { 
  kebabCase, 
  pascalCase, 
  camelCase, 
  snakeCase, 
  pluralize,
  ensureDir,
  writeFile,
  getCurrentYear
} from './utils.js'
import { generateAllFiles } from './fileGenerator.js'

/**
 * Processes user answers into complete plugin metadata
 * 
 * This function takes the raw answers from prompts and transforms them into
 * a comprehensive metadata object with all naming variations and paths resolved.
 * 
 * @example
 * const answers = { pluginName: 'Inventory Management', ... }
 * const meta = processMetadata(answers)
 * console.log(meta.id) // 'inventory-management'
 * console.log(meta.packageName) // '@core-erp/plugin-inventory-management'
 * 
 * @param answers - User answers from prompts
 * @returns Complete plugin metadata
 */
export function processMetadata(answers: PromptAnswers): PluginMetadata {
  const pluginId = kebabCase(answers.pluginName)
  const resourceNamePascal = pascalCase(answers.resourceName)
  
  // Convert feature array to feature object
  const features: PluginFeatures = {
    frontend: answers.features.includes('frontend'),
    menu: answers.features.includes('menu'),
    widgets: answers.features.includes('widgets'),
    backend: answers.features.includes('backend'),
    database: answers.features.includes('database'),
    permissions: answers.features.includes('permissions'),
    translations: answers.features.includes('translations'),
    events: answers.features.includes('events'),
  }
  
  // Resolve absolute output directory path
  const outputDir = path.isAbsolute(answers.outputDirectory)
    ? answers.outputDirectory
    : path.resolve(process.cwd(), answers.outputDirectory)
  
  return {
    name: answers.pluginName,
    id: pluginId,
    packageName: `@core-erp/plugin-${pluginId}`,
    description: answers.description,
    author: answers.author,
    category: answers.category,
    outputDir,
    features,
    
    // Resource name variations (singular)
    resourceName: resourceNamePascal,
    resourceNameCamel: camelCase(answers.resourceName),
    resourceNameKebab: kebabCase(answers.resourceName),
    resourceNameSnake: snakeCase(answers.resourceName),
    
    // Resource name variations (plural)
    resourceNamePlural: pascalCase(pluralize(answers.resourceName)),
    resourceNameCamelPlural: camelCase(pluralize(answers.resourceName)),
    resourceNameKebabPlural: kebabCase(pluralize(answers.resourceName)),
    resourceNameSnakePlural: snakeCase(pluralize(answers.resourceName)),
    
    year: getCurrentYear(),
  }
}

/**
 * Generates the plugin directory structure
 * 
 * Creates all necessary directories based on selected features.
 * 
 * @param meta - Plugin metadata
 */
async function createDirectoryStructure(meta: PluginMetadata): Promise<void> {
  const { outputDir, features } = meta
  
  // Base directories (always created)
  await ensureDir(outputDir)
  await ensureDir(path.join(outputDir, 'src'))
  
  // Feature-specific directories
  if (features.frontend) {
    await ensureDir(path.join(outputDir, 'src', 'frontend'))
    await ensureDir(path.join(outputDir, 'src', 'frontend', 'pages'))
    await ensureDir(path.join(outputDir, 'src', 'frontend', 'components'))
    await ensureDir(path.join(outputDir, 'src', 'frontend', 'hooks'))
  }
  
  if (features.widgets) {
    await ensureDir(path.join(outputDir, 'src', 'frontend', 'widgets'))
  }
  
  if (features.backend) {
    await ensureDir(path.join(outputDir, 'src', 'backend'))
    await ensureDir(path.join(outputDir, 'src', 'backend', 'functions'))
    await ensureDir(path.join(outputDir, 'src', 'backend', 'functions', `manage-${meta.resourceNameKebabPlural}`))
  }
  
  if (features.database) {
    await ensureDir(path.join(outputDir, 'src', 'database'))
    await ensureDir(path.join(outputDir, 'src', 'database', 'migrations'))
  }
  
  if (features.permissions) {
    await ensureDir(path.join(outputDir, 'src', 'permissions'))
  }
  
  if (features.translations) {
    await ensureDir(path.join(outputDir, 'src', 'translations'))
  }
  
  if (features.events) {
    await ensureDir(path.join(outputDir, 'src', 'events'))
  }
}

/**
 * Writes all generated files to disk
 * 
 * @param meta - Plugin metadata
 * @param files - Array of files to generate
 * @returns Array of written file paths
 */
async function writeFiles(
  meta: PluginMetadata,
  files: Array<{ path: string; content: string }>
): Promise<string[]> {
  const writtenPaths: string[] = []
  
  for (const file of files) {
    const fullPath = path.join(meta.outputDir, file.path)
    await writeFile(fullPath, file.content)
    writtenPaths.push(file.path)
  }
  
  return writtenPaths
}

/**
 * Main generation function
 * 
 * This is the entry point for plugin generation. It:
 * 1. Processes metadata
 * 2. Creates directory structure
 * 3. Generates files from templates
 * 4. Writes files to disk
 * 5. Returns generation summary
 * 
 * @example
 * const answers = await runPrompts()
 * const result = await generatePlugin(answers)
 * if (result.success) {
 *   console.log(`Generated ${result.filesGenerated} files`)
 * }
 * 
 * @param answers - User answers from prompts
 * @returns Generation result with status and file list
 */
export async function generatePlugin(answers: PromptAnswers): Promise<GenerationResult> {
  const spinner = ora('Generating plugin...').start()
  
  try {
    // Process metadata
    spinner.text = 'Processing configuration...'
    const meta = processMetadata(answers)
    
    // Create directory structure
    spinner.text = 'Creating directory structure...'
    await createDirectoryStructure(meta)
    
    // Generate files from templates
    spinner.text = 'Generating files from templates...'
    const files = generateAllFiles(meta)
    
    // Write files to disk
    spinner.text = 'Writing files...'
    const writtenPaths = await writeFiles(meta, files)
    
    spinner.succeed(chalk.green('Plugin generated successfully!'))
    
    return {
      success: true,
      pluginDir: meta.outputDir,
      filesGenerated: writtenPaths.length,
      files: writtenPaths,
    }
  } catch (error) {
    spinner.fail(chalk.red('Plugin generation failed'))
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return {
      success: false,
      pluginDir: answers.outputDirectory,
      filesGenerated: 0,
      files: [],
      errors: [errorMessage],
    }
  }
}

/**
 * Displays the generation summary and next steps
 * 
 * @param result - Generation result
 * @param meta - Plugin metadata
 */
export function displaySummary(result: GenerationResult, meta: PluginMetadata): void {
  console.log()
  
  if (!result.success) {
    console.log(chalk.red.bold('❌ Generation Failed\n'))
    if (result.errors) {
      result.errors.forEach(error => {
        console.log(chalk.red(`   ${error}`))
      })
    }
    return
  }
  
  console.log(chalk.green.bold('✅ Plugin Generated Successfully!\n'))
  
  console.log(chalk.cyan('📦 Package Information:'))
  console.log(chalk.gray(`   Name: ${meta.packageName}`))
  console.log(chalk.gray(`   Location: ${result.pluginDir}`))
  console.log(chalk.gray(`   Files: ${result.filesGenerated} files generated\n`))
  
  console.log(chalk.cyan('📝 Generated Files:'))
  result.files.forEach(file => {
    console.log(chalk.gray(`   ✓ ${file}`))
  })
  
  console.log()
  console.log(chalk.yellow.bold('🚀 Next Steps:\n'))
  
  const pluginDirRelative = path.relative(process.cwd(), result.pluginDir)
  
  console.log(chalk.white('1. Navigate to your plugin directory:'))
  console.log(chalk.cyan(`   cd ${pluginDirRelative}\n`))
  
  console.log(chalk.white('2. Install dependencies:'))
  console.log(chalk.cyan('   npm install\n'))
  
  console.log(chalk.white('3. Build the plugin:'))
  console.log(chalk.cyan('   npm run build\n'))
  
  console.log(chalk.white('4. Install in Core ERP:'))
  console.log(chalk.cyan('   cd ../../core-erp'))
  console.log(chalk.cyan(`   npm install ${pluginDirRelative}\n`))
  
  console.log(chalk.white('5. Configure in plugins.config.ts:'))
  console.log(chalk.cyan(`   Add configuration for '${meta.packageName}'\n`))
  
  console.log(chalk.white('6. Restart Core ERP:'))
  console.log(chalk.cyan('   npm run dev\n'))
  
  console.log(chalk.gray('📖 For more information, see the generated README.md in your plugin directory.\n'))
}

