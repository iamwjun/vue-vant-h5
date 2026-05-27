export interface RechargeCenterOverview {
  balance: number
  availableBalance: number
  frozenAmount: number
  currency: string
}

export interface BalanceDetailListParams {
  pageNo: number
  pageSize: number
  month?: string
  type?: string
}

export interface BalanceDetailItem {
  id: string
  billNo: string
  title: string
  type: string
  typeName: string
  direction: 'income' | 'expense'
  amount: number
  balanceAfter: number
  createdAt: string
  status: string
  statusName: string
}

export interface BalanceDetailListResult {
  total: number
  list: BalanceDetailItem[]
}

export interface BalanceDetailDetail extends BalanceDetailItem {
  channel: string
  storeName: string
  operator: string
  remark: string
}

export interface OrderDetail {
  id: string
  orderNo: string
  title: string
  amount: number
  status: string
  statusName: string
  createdAt: string
}

export interface RenewalStorePeriodData {
  periodStart: string
  periodEnd: string
  storeCount: number
  amount: number
}
