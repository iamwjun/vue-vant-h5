import { get, post } from '@/api/http'
import type {
  WalletBalance,
  WalletBillListParams,
  WalletBillListResult,
  WalletRechargeParams,
  WalletRechargeResult,
} from '@/types'

export function fetchWalletBalanceApi(tenantId: string) {
  return get<WalletBalance>(`/capital/wallet/${tenantId}/balance`)
}

export function submitWalletRechargeApi(params: WalletRechargeParams) {
  return post<WalletRechargeResult, WalletRechargeParams>('/capital/wallet/recharge', params)
}

export function fetchWalletBillsApi(params: WalletBillListParams) {
  return post<WalletBillListResult, WalletBillListParams>('/capital/wallet/bills', params)
}
