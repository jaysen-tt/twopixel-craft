export interface ApiClientConfig {
  baseUrl: string
  timeout?: number
}

const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: 'http://43.160.252.207:16686',
  timeout: 30000,
}

let customConfig: Partial<ApiClientConfig> = {}

export function setApiClientConfig(config: Partial<ApiClientConfig>): void {
  customConfig = { ...customConfig, ...config }
}

export function getApiClientConfig(): ApiClientConfig {
  return {
    ...DEFAULT_CONFIG,
    ...customConfig,
  }
}

export function resetApiClientConfig(): void {
  customConfig = {}
}
