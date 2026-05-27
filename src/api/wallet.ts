import { get, post } from '@/api/http'
import type { WalletBalance, WalletRechargeParams, WalletRechargeResult } from '@/types'

export function fetchWalletBalanceApi(tenantId: string) {
  return get<WalletBalance>(`/capital/wallet/${tenantId}/balance`)
}

export function submitWalletRechargeApi(params: WalletRechargeParams) {
  return post<WalletRechargeResult, WalletRechargeParams>('/capital/wallet/recharge', params)
}
