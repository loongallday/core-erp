/**
 * Dependency Resolver
 * 
 * Resolves plugin dependencies and determines the correct load order.
 * Handles circular dependencies and missing dependencies.
 */

import { LoadedPlugin } from './types'

interface DependencyNode {
  id: string
  dependencies: string[]
  dependents: string[]
}

export class DependencyResolver {
  /**
   * Resolve plugin load order based on dependencies
   * 
   * @param plugins - Map of plugin IDs to their manifests
   * @returns Array of plugin IDs in load order
   * @throws Error if circular dependencies or missing dependencies detected
   */
  resolve(plugins: Map<string, LoadedPlugin>): string[] {
    // Build dependency graph
    const graph = this.buildDependencyGraph(plugins)

    // Check for circular dependencies
    this.checkCircularDependencies(graph)

    // Check for missing dependencies
    this.checkMissingDependencies(graph, plugins)

    // Topological sort to determine load order
    return this.topologicalSort(graph)
  }

  /**
   * Build dependency graph from plugins
   */
  private buildDependencyGraph(plugins: Map<string, LoadedPlugin>): Map<string, DependencyNode> {
    const graph = new Map<string, DependencyNode>()

    // Initialize nodes
    for (const [pluginId, plugin] of plugins) {
      graph.set(pluginId, {
        id: pluginId,
        dependencies: plugin.manifest.dependencies?.plugins || [],
        dependents: [],
      })
    }

    // Build dependent relationships
    for (const node of graph.values()) {
      for (const depId of node.dependencies) {
        const depNode = graph.get(depId)
        if (depNode) {
          depNode.dependents.push(node.id)
        }
      }
    }

    return graph
  }

  /**
   * Check for circular dependencies
   */
  private checkCircularDependencies(graph: Map<string, DependencyNode>): void {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)

      const node = graph.get(nodeId)
      if (!node) return false

      for (const depId of node.dependencies) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) {
            return true
          }
        } else if (recursionStack.has(depId)) {
          // Found a cycle
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const nodeId of graph.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) {
          throw new Error(
            'Circular dependency detected in plugin dependencies. ' +
            'Please check your plugin dependency chain.'
          )
        }
      }
    }
  }

  /**
   * Check for missing dependencies
   */
  private checkMissingDependencies(
    graph: Map<string, DependencyNode>,
    plugins: Map<string, LoadedPlugin>
  ): void {
    const missingDeps: string[] = []

    for (const node of graph.values()) {
      for (const depId of node.dependencies) {
        if (!plugins.has(depId)) {
          missingDeps.push(`${node.id} requires ${depId}`)
        }
      }
    }

    if (missingDeps.length > 0) {
      throw new Error(
        'Missing plugin dependencies:\n' +
        missingDeps.map(dep => `  - ${dep}`).join('\n')
      )
    }
  }

  /**
   * Topological sort using Kahn's algorithm
   * Returns plugins in load order (dependencies first)
   */
  private topologicalSort(graph: Map<string, DependencyNode>): string[] {
    const result: string[] = []
    const inDegree = new Map<string, number>()
    const queue: string[] = []

    // Calculate in-degree for each node
    for (const node of graph.values()) {
      inDegree.set(node.id, node.dependencies.length)

      // Nodes with no dependencies can be loaded first
      if (node.dependencies.length === 0) {
        queue.push(node.id)
      }
    }

    // Process queue
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      result.push(nodeId)

      const node = graph.get(nodeId)
      if (!node) continue

      // Reduce in-degree for all dependents
      for (const dependentId of node.dependents) {
        const currentInDegree = inDegree.get(dependentId)!
        inDegree.set(dependentId, currentInDegree - 1)

        // If all dependencies are satisfied, add to queue
        if (inDegree.get(dependentId) === 0) {
          queue.push(dependentId)
        }
      }
    }

    // If result doesn't contain all nodes, there's a cycle
    if (result.length !== graph.size) {
      throw new Error('Failed to resolve plugin dependencies (circular dependency detected)')
    }

    return result
  }

  /**
   * Get dependency chain for a plugin
   */
  getDependencyChain(
    pluginId: string,
    plugins: Map<string, LoadedPlugin>
  ): string[] {
    const chain: string[] = []
    const visited = new Set<string>()

    const traverse = (id: string) => {
      if (visited.has(id)) return
      visited.add(id)

      const plugin = plugins.get(id)
      if (!plugin) return

      const deps = plugin.manifest.dependencies?.plugins || []
      for (const depId of deps) {
        traverse(depId)
      }

      chain.push(id)
    }

    traverse(pluginId)
    return chain
  }

  /**
   * Get plugins that depend on a specific plugin
   */
  getDependents(
    pluginId: string,
    plugins: Map<string, LoadedPlugin>
  ): string[] {
    const dependents: string[] = []

    for (const [id, plugin] of plugins) {
      const deps = plugin.manifest.dependencies?.plugins || []
      if (deps.includes(pluginId)) {
        dependents.push(id)
      }
    }

    return dependents
  }

  /**
   * Check if plugin A depends on plugin B
   */
  dependsOn(
    pluginA: string,
    pluginB: string,
    plugins: Map<string, LoadedPlugin>
  ): boolean {
    const chain = this.getDependencyChain(pluginA, plugins)
    return chain.includes(pluginB)
  }

  /**
   * Visualize dependency graph (for debugging)
   */
  visualize(plugins: Map<string, LoadedPlugin>): string {
    const graph = this.buildDependencyGraph(plugins)
    let output = 'Plugin Dependency Graph:\n\n'

    for (const node of graph.values()) {
      output += `${node.id}:\n`
      
      if (node.dependencies.length > 0) {
        output += `  Dependencies: ${node.dependencies.join(', ')}\n`
      } else {
        output += `  Dependencies: (none)\n`
      }

      if (node.dependents.length > 0) {
        output += `  Dependents: ${node.dependents.join(', ')}\n`
      } else {
        output += `  Dependents: (none)\n`
      }

      output += '\n'
    }

    return output
  }
}

