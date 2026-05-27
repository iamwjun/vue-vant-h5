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

export type WalletBillDirection = 'income' | 'expense'

export interface WalletBill {
  id: string
  billNo: string
  month: string
  date: string
  time: string
  createdAt: string
  title: string
  type: string
  typeName: string
  direction: WalletBillDirection
  amount: number
  amountText: string
  balanceAfter: number
  channel: string
  status: string
  statusName: string
  storeName: string
  operator: string
  remark: string
}

export interface WalletBillListParams {
  pageNo: number
  pageSize: number
}

export interface WalletBillListResult {
  pageNo: number
  pageSize: number
  total: number
  list: WalletBill[]
}

export type WalletBillDetail = WalletBill
