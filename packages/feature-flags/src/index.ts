/// <reference types="node" />

export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  environments: string[]
  rolloutPercentage: number
  conditions?: FeatureFlagCondition[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface FeatureFlagCondition {
  type: 'user_id' | 'user_group' | 'company_id' | 'custom'
  operator: 'in' | 'not_in' | 'equals' | 'not_equals' | 'contains'
  values: string[]
}

export interface FeatureFlagContext {
  userId?: string
  userGroups?: string[]
  companyId?: string
  environment: string
  custom?: Record<string, any>
}

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map()
  private remoteUrl?: string
  private apiKey?: string
  private refreshInterval: number = 60000 // 1 minute
  private lastRefresh: Date = new Date(0)

  constructor(config?: {
    remoteUrl?: string
    apiKey?: string
    refreshInterval?: number
  }) {
    this.remoteUrl = config?.remoteUrl
    this.apiKey = config?.apiKey
    this.refreshInterval = config?.refreshInterval || 60000
  }

  async initialize(): Promise<void> {
    await this.loadFlags()
    this.startAutoRefresh()
  }

  private async loadFlags(): Promise<void> {
    try {
      if (this.remoteUrl) {
        await this.loadFromRemote()
      } else {
        await this.loadFromLocal()
      }
      this.lastRefresh = new Date()
    } catch (error) {
      console.error('Failed to load feature flags:', error)
      await this.loadFromLocal() // Fallback to local
    }
  }

  private async loadFromRemote(): Promise<void> {
    if (!this.remoteUrl) return

    const response = await fetch(this.remoteUrl, {
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    this.flags.clear()
    
    data.flags.forEach((flag: FeatureFlag) => {
      this.flags.set(flag.id, flag)
    })
  }

  private async loadFromLocal(): Promise<void> {
    // Fallback default flags
    const defaultFlags: FeatureFlag[] = [
      {
        id: 'new_dashboard',
        name: 'New Dashboard',
        description: 'Enable new dashboard UI',
        enabled: false,
        environments: ['development', 'staging'],
        rolloutPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Enable advanced analytics features',
        enabled: false,
        environments: ['development'],
        rolloutPercentage: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      },
      {
        id: 'dark_mode',
        name: 'Dark Mode',
        description: 'Enable dark mode theme',
        enabled: true,
        environments: ['development', 'staging', 'production'],
        rolloutPercentage: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      }
    ]

    this.flags.clear()
    defaultFlags.forEach(flag => this.flags.set(flag.id, flag))
  }

  private startAutoRefresh(): void {
    setInterval(async () => {
      await this.loadFlags()
    }, this.refreshInterval)
  }

  isEnabled(flagId: string, context: FeatureFlagContext): boolean {
    const flag = this.flags.get(flagId)
    
    if (!flag) {
      console.warn(`Feature flag '${flagId}' not found`)
      return false
    }

    // Check if flag is enabled for environment
    if (!flag.environments.includes(context.environment)) {
      return false
    }

    // Check base enabled state
    if (!flag.enabled) {
      return false
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashString(`${flagId}:${context.userId || context.companyId || 'anonymous'}`)
      const percentage = hash % 100
      if (percentage >= flag.rolloutPercentage) {
        return false
      }
    }

    // Check conditions
    if (flag.conditions && flag.conditions.length > 0) {
      return this.evaluateConditions(flag.conditions, context)
    }

    return true
  }

  private evaluateConditions(conditions: FeatureFlagCondition[], context: FeatureFlagContext): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'user_id':
          if (!context.userId) return false
          return this.evaluateCondition(condition, [context.userId])
        
        case 'user_group':
          if (!context.userGroups) return false
          return this.evaluateCondition(condition, context.userGroups)
        
        case 'company_id':
          if (!context.companyId) return false
          return this.evaluateCondition(condition, [context.companyId])
        
        case 'custom':
          // Custom condition evaluation based on metadata
          return this.evaluateCustomCondition(condition, context)
        
        default:
          return false
      }
    })
  }

  private evaluateCondition(condition: FeatureFlagCondition, values: string[]): boolean {
    switch (condition.operator) {
      case 'in':
        return values.some(value => condition.values.includes(value))
      
      case 'not_in':
        return !values.some(value => condition.values.includes(value))
      
      case 'equals':
        return values.length === 1 && condition.values.includes(values[0])
      
      case 'not_equals':
        return values.length !== 1 || !condition.values.includes(values[0])
      
      case 'contains':
        return values.some(value => 
          condition.values.some(condValue => value.includes(condValue))
        )
      
      default:
        return false
    }
  }

  private evaluateCustomCondition(condition: FeatureFlagCondition, context: FeatureFlagContext): boolean {
    // Implement custom condition logic based on your needs
    return true
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Admin methods
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values())
  }

  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.get(flagId)
  }

  async updateFlag(flagId: string, updates: Partial<FeatureFlag>): Promise<boolean> {
    const flag = this.flags.get(flagId)
    if (!flag) return false

    const updatedFlag = { 
      ...flag, 
      ...updates, 
      updatedAt: new Date() 
    }
    
    this.flags.set(flagId, updatedFlag)

    // If remote URL is configured, sync to remote
    if (this.remoteUrl) {
      try {
        await this.syncFlagToRemote(updatedFlag)
      } catch (error) {
        console.error('Failed to sync flag to remote:', error)
        return false
      }
    }

    return true
  }

  async createFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.flags.set(flag.id, newFlag)

    if (this.remoteUrl) {
      try {
        await this.syncFlagToRemote(newFlag)
      } catch (error) {
        console.error('Failed to sync new flag to remote:', error)
        this.flags.delete(flag.id)
        return false
      }
    }

    return true
  }

  private async syncFlagToRemote(flag: FeatureFlag): Promise<void> {
    if (!this.remoteUrl) return

    const response = await fetch(`${this.remoteUrl}/flags/${flag.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify(flag)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // React hook for easy usage
  static useFeatureFlag(flagId: string, context: FeatureFlagContext, manager: FeatureFlagManager): boolean {
    return manager.isEnabled(flagId, context)
  }
}

// React Hook
export function createFeatureFlagHook(manager: FeatureFlagManager) {
  return function useFeatureFlag(flagId: string, context: FeatureFlagContext): boolean {
    return manager.isEnabled(flagId, context)
  }
}

// Global instance
export const featureFlagManager = new FeatureFlagManager({
  remoteUrl: process.env.FEATURE_FLAGS_URL,
  apiKey: process.env.FEATURE_FLAGS_API_KEY,
  refreshInterval: 30000 // 30 seconds
}) 