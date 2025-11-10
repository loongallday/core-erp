/**
 * Plugin Validator
 * 
 * Validates plugin manifests and configuration for compatibility and correctness.
 * Performs version checks, dependency validation, and schema validation.
 */

import {
  PluginManifest,
  PluginConfiguration,
  PluginValidationResult,
  PluginValidationError,
  PluginValidationWarning,
} from './types'
import { satisfies, coerce } from 'semver'

// Import package.json to get core version
import packageJson from '../../../package.json'

export class PluginValidator {
  private coreVersion: string

  constructor() {
    this.coreVersion = packageJson.version
  }

  /**
   * Validate a plugin manifest and configuration
   */
  async validate(
    manifest: PluginManifest,
    config: PluginConfiguration
  ): Promise<PluginValidationResult> {
    const errors: PluginValidationError[] = []
    const warnings: PluginValidationWarning[] = []

    // 1. Validate core version compatibility
    const versionCheck = this.validateCoreVersion(manifest)
    if (!versionCheck.valid) {
      errors.push({
        code: 'INCOMPATIBLE_CORE_VERSION',
        message: versionCheck.message!,
        field: 'coreVersion',
      })
    }

    // 2. Validate manifest structure
    const structureErrors = this.validateManifestStructure(manifest)
    errors.push(...structureErrors)

    // 3. Validate configuration against schema
    if (manifest.config?.schema && config.config) {
      try {
        manifest.config.schema.parse(config.config)
      } catch (error: any) {
        errors.push({
          code: 'INVALID_CONFIGURATION',
          message: `Configuration validation failed: ${error.message}`,
          field: 'config',
        })
      }
    }

    // 4. Validate permissions format
    const permissionErrors = this.validatePermissions(manifest)
    errors.push(...permissionErrors)

    // 5. Validate event names format
    const eventErrors = this.validateEvents(manifest)
    errors.push(...eventErrors)

    // 6. Check for potential issues (warnings)
    const potentialIssues = this.checkPotentialIssues(manifest, config)
    warnings.push(...potentialIssues)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Validate core version compatibility
   */
  private validateCoreVersion(manifest: PluginManifest): { valid: boolean; message?: string } {
    if (!manifest.coreVersion) {
      return {
        valid: false,
        message: 'Plugin manifest must specify coreVersion',
      }
    }

    try {
      const currentVersion = coerce(this.coreVersion)
      if (!currentVersion) {
        return {
          valid: false,
          message: `Invalid core version: ${this.coreVersion}`,
        }
      }

      const isCompatible = satisfies(currentVersion, manifest.coreVersion)

      if (!isCompatible) {
        return {
          valid: false,
          message: `Plugin requires core version ${manifest.coreVersion}, but current version is ${this.coreVersion}`,
        }
      }

      return { valid: true }
      } catch {
      return {
        valid: false,
        message: `Invalid version range in coreVersion: ${manifest.coreVersion}`,
      }
    }
  }

  /**
   * Validate manifest structure
   */
  private validateManifestStructure(manifest: PluginManifest): PluginValidationError[] {
    const errors: PluginValidationError[] = []

    // Check required fields
    const requiredFields: Array<keyof PluginManifest> = [
      'id',
      'name',
      'version',
      'description',
      'author',
      'category',
    ]

    for (const field of requiredFields) {
      if (!manifest[field]) {
        errors.push({
          code: 'MISSING_REQUIRED_FIELD',
          message: `Required field "${field}" is missing`,
          field,
        })
      }
    }

    // Validate ID format
    if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push({
        code: 'INVALID_ID_FORMAT',
        message: 'Plugin ID must be lowercase alphanumeric with hyphens only',
        field: 'id',
      })
    }

    // Validate version format
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push({
        code: 'INVALID_VERSION_FORMAT',
        message: 'Plugin version must be valid semver (e.g., 1.0.0)',
        field: 'version',
      })
    }

    // Validate category
    const validCategories = [
      'operations',
      'sales',
      'finance',
      'hr',
      'analytics',
      'integration',
      'utility',
      'custom',
    ]
    if (manifest.category && !validCategories.includes(manifest.category)) {
      errors.push({
        code: 'INVALID_CATEGORY',
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        field: 'category',
      })
    }

    return errors
  }

  /**
   * Validate permissions format
   */
  private validatePermissions(manifest: PluginManifest): PluginValidationError[] {
    const errors: PluginValidationError[] = []

    // Permissions will be loaded dynamically, so we can't validate them here
    // But we can check that the permissions field is a function
    if (manifest.permissions && typeof manifest.permissions !== 'function') {
      errors.push({
        code: 'INVALID_PERMISSIONS_FORMAT',
        message: 'Permissions must be a function that returns a promise',
        field: 'permissions',
      })
    }

    return errors
  }

  /**
   * Validate event names format
   */
  private validateEvents(manifest: PluginManifest): PluginValidationError[] {
    const errors: PluginValidationError[] = []

    if (manifest.events?.emits) {
      for (const eventName of manifest.events.emits) {
        // Event names should follow pattern: plugin-id:event-name
        if (!eventName.includes(':')) {
          errors.push({
            code: 'INVALID_EVENT_NAME',
            message: `Event name must follow pattern "plugin-id:event-name": ${eventName}`,
            field: 'events.emits',
          })
        }
      }
    }

    return errors
  }

  /**
   * Check for potential issues (warnings)
   */
  private checkPotentialIssues(
    manifest: PluginManifest,
    config: PluginConfiguration
  ): PluginValidationWarning[] {
    const warnings: PluginValidationWarning[] = []

    // Warn if plugin has no homepage
    if (!manifest.homepage) {
      warnings.push({
        code: 'MISSING_HOMEPAGE',
        message: 'Plugin does not specify a homepage URL',
        field: 'homepage',
      })
    }

    // Warn if plugin has no license
    if (!manifest.license) {
      warnings.push({
        code: 'MISSING_LICENSE',
        message: 'Plugin does not specify a license',
        field: 'license',
      })
    }

    // Warn if plugin has dependencies
    if (manifest.dependencies?.plugins && manifest.dependencies.plugins.length > 0) {
      warnings.push({
        code: 'HAS_DEPENDENCIES',
        message: `Plugin depends on: ${manifest.dependencies.plugins.join(', ')}`,
        field: 'dependencies',
      })
    }

    // Warn if config is enabled but plugin has no lifecycle hooks
    if (config.enabled && !manifest.lifecycle?.onEnable) {
      warnings.push({
        code: 'MISSING_LIFECYCLE_HOOKS',
        message: 'Plugin is enabled but has no onEnable lifecycle hook',
        field: 'lifecycle',
      })
    }

    // Warn if plugin declares many permissions
    if (manifest.permissions) {
      warnings.push({
        code: 'CHECK_PERMISSIONS',
        message: 'Ensure all declared permissions are necessary and properly documented',
        field: 'permissions',
      })
    }

    return warnings
  }

  /**
   * Validate plugin health
   */
  async validateHealth(manifest: PluginManifest): Promise<boolean> {
    if (!manifest.healthCheck) {
      // No health check defined, assume healthy
      return true
    }

    try {
      const health = await manifest.healthCheck()
      return health.healthy
    } catch (_error) {
      console.error(`[PluginValidator] Health check failed:`, _error)
      return false
    }
  }
}

