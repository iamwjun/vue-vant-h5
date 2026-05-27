export interface WalletBalance {
  tenantId: string
  balance: number
  availableBalance: number
  frozenAmount: number
  currency: string
  updatedAt: string
}

export interface WalletRechargeParams {
  tenantId: string
  amount: number
}

export interface WalletRechargeResult {
  orderNo: string
  amount: number
  balance: number
  paidAt: string
  status: 'success'
}
