export interface ApiClientConfig {
  baseUrl: string
  timeout?: number
}

const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: import.meta.env.DEV ? 'http://localhost:5173' : 'https://api.2pixel.cn',
  timeout: 30000,
}

let customConfig: Partial<ApiClientConfig> = {}

export function setApiClientConfig(config: Partial<ApiClientConfig>): void {
  customConfig = { ...customConfig, ...config }
}

export function getApiClientConfig(): ApiClientConfig {
  const config = {
    ...DEFAULT_CONFIG,
    ...customConfig,
  }
  console.log('[ApiClientConfig] Resolved config:', config, 'DEV:', import.meta.env.DEV)
  return config
}

export function resetApiClientConfig(): void {
  customConfig = {}
}
