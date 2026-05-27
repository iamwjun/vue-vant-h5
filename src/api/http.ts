import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { showFailToast } from 'vant'
import 'vant/es/toast/style'

import { appConfig } from '@/config/env'

const SUCCESS_CODE = 200
const UNAUTHORIZED_CODE = 401
const DEFAULT_ERROR_MESSAGE = '请求失败，请稍后重试'
const LOGIN_INVALID_MESSAGE = '登录失效，请重新登录'
const AUTH_TOKEN_STORAGE_KEY = 'access_token'

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
  msg?: string
}

declare module 'axios' {
  interface AxiosRequestConfig {
    returnRawResponse?: boolean
    showErrorToast?: boolean
    withToken?: boolean
  }
}

type BusinessError = Error & {
  code: number
  response: ApiResponse<unknown>
}

function getStoredToken(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? ''
}

function normalizeToken(token: string): string {
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

function getMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const message = Reflect.get(payload, 'message') ?? Reflect.get(payload, 'msg')
  return typeof message === 'string' && message.trim() ? message : undefined
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  return typeof Reflect.get(payload, 'code') === 'number'
}

function createBusinessError(code: number, message: string, response: ApiResponse<unknown>): BusinessError {
  const error = new Error(message) as BusinessError
  error.name = 'BusinessError'
  error.code = code
  error.response = response
  return error
}

function showRequestError(message: string) {
  showFailToast({
    message,
    forbidClick: true,
  })
}

function clearAuthToken() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

function resolveHttpErrorMessage(error: AxiosError<ApiResponse<unknown>>): string {
  if (error.code === 'ECONNABORTED') {
    return '请求超时，请稍后重试'
  }

  if (error.message === 'Network Error') {
    return '网络异常，请检查网络连接'
  }

  return getMessage(error.response?.data) ?? DEFAULT_ERROR_MESSAGE
}

function handleUnauthorized(showErrorToast = true) {
  clearAuthToken()

  if (showErrorToast) {
    showRequestError(LOGIN_INVALID_MESSAGE)
  }
}

const service = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 15000,
})

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.withToken === false) {
    return config
  }

  const token = getStoredToken()
  if (!token) {
    return config
  }

  const headers = AxiosHeaders.from(config.headers)
  if (!headers.has('Authorization')) {
    headers.set('Authorization', normalizeToken(token))
  }

  config.headers = headers
  return config
})

service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown> | unknown>) => {
    if (response.config.returnRawResponse) {
      return response as never
    }

    const payload = response.data
    if (!isApiResponse(payload)) {
      return payload as never
    }

    if (payload.code === SUCCESS_CODE) {
      return payload.data as never
    }

    if (payload.code === UNAUTHORIZED_CODE) {
      handleUnauthorized(response.config.showErrorToast !== false)
      return Promise.reject(createBusinessError(payload.code, LOGIN_INVALID_MESSAGE, payload))
    }

    const message = getMessage(payload) ?? DEFAULT_ERROR_MESSAGE
    if (response.config.showErrorToast !== false) {
      showRequestError(message)
    }

    return Promise.reject(createBusinessError(payload.code, message, payload))
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    if (error.response?.status === UNAUTHORIZED_CODE) {
      handleUnauthorized(error.config?.showErrorToast !== false)
      return Promise.reject(error)
    }

    if (error.config?.showErrorToast !== false) {
      showRequestError(resolveHttpErrorMessage(error))
    }

    return Promise.reject(error)
  },
)

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function removeAuthToken() {
  clearAuthToken()
}

export function getAuthToken() {
  return getStoredToken()
}

export function request<T = unknown, D = unknown>(config: AxiosRequestConfig<D>) {
  return service.request<T, T, D>(config)
}

export function get<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return service.get<T, T>(url, config)
}

export function post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
  return service.post<T, T, D>(url, data, config)
}

export function put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>) {
  return service.put<T, T, D>(url, data, config)
}

export function del<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return service.delete<T, T>(url, config)
}

export { AUTH_TOKEN_STORAGE_KEY, LOGIN_INVALID_MESSAGE, SUCCESS_CODE, UNAUTHORIZED_CODE, service as http }
