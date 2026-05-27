type RequiredAppEnvKey = 'VITE_APP_TITLE' | 'VITE_API_BASE_URL'

function getRequiredEnv(name: RequiredAppEnvKey): string {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`[env] Missing required variable: ${name}`)
  }

  return value
}

function getBooleanEnv(name: 'VITE_ENABLE_MOCK', fallback = false): boolean {
  const value = import.meta.env[name]

  if (value === undefined) {
    return fallback
  }

  if (value !== 'true' && value !== 'false') {
    throw new Error(`[env] ${name} must be "true" or "false", received "${value}"`)
  }

  return value === 'true'
}

export const appConfig = Object.freeze({
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appTitle: getRequiredEnv('VITE_APP_TITLE'),
  apiBaseUrl: getRequiredEnv('VITE_API_BASE_URL'),
  enableMock: getBooleanEnv('VITE_ENABLE_MOCK'),
})
