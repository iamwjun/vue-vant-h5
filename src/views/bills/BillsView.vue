<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Empty as VanEmpty, List as VanList, NavBar as VanNavBar } from 'vant'
import 'vant/es/empty/style'
import 'vant/es/list/style'
import 'vant/es/nav-bar/style'

import { fetchWalletBillsApi } from '@/api/wallet'
import type { WalletBill, WalletBillDirection } from '@/types'

const PAGE_SIZE = 20

interface WalletBillMonthGroup {
  month: string
  monthName: string
  total: number
  incomeTotal: number
  expenseTotal: number
  list: WalletBill[]
}

const router = useRouter()

const billList = ref<WalletBill[]>([])
const pageNo = ref(1)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)
const loadError = ref(false)
const firstLoaded = ref(false)

const groupedBills = computed(() => {
  const groupMap = new Map<string, WalletBillMonthGroup>()

  billList.value.forEach((bill) => {
    const group = groupMap.get(bill.month) ?? {
      month: bill.month,
      monthName: getMonthName(bill.month),
      total: 0,
      incomeTotal: 0,
      expenseTotal: 0,
      list: [],
    }

    group.total += 1
    group.list.push(bill)

    if (bill.status !== 'failed') {
      if (bill.direction === 'income') {
        group.incomeTotal += bill.amount
      } else {
        group.expenseTotal += bill.amount
      }
    }

    groupMap.set(bill.month, group)
  })

  return Array.from(groupMap.values())
})

function getMonthName(month: string) {
  const [year, monthValue] = month.split('-')

  return `${year}年${monthValue}月`
}

function formatCurrency(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getAmountClass(direction: WalletBillDirection) {
  return direction === 'income' ? 'bill-row__amount--income' : 'bill-row__amount--expense'
}

function getDirectionLabel(direction: WalletBillDirection) {
  return direction === 'income' ? '入' : '出'
}

function goToBillDetail(bill: WalletBill) {
  void router.push({
    name: 'bill-detail',
    params: {
      id: bill.id,
    },
  })
}

async function loadBills() {
  loadError.value = false

  try {
    const result = await fetchWalletBillsApi({
      pageNo: pageNo.value,
      pageSize: PAGE_SIZE,
    })

    billList.value = [...billList.value, ...result.list]
    total.value = result.total
    pageNo.value += 1
    finished.value = billList.value.length >= result.total || result.list.length < PAGE_SIZE
    firstLoaded.value = true
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="bills-page">
    <VanNavBar
      title="帐单"
      left-arrow
      fixed
      safe-area-inset-top
      class="bills-navbar"
      @click-left="router.back()"
    />

    <main class="bills-content">
      <section class="bills-overview" aria-label="帐单概览">
        <div>
          <span class="bills-overview__eyebrow">Wallet ledger</span>
          <h1>帐单明细</h1>
        </div>
        <div class="bills-overview__meta">
          <strong>{{ total }}</strong>
          <span>总笔数</span>
        </div>
      </section>

      <VanList
        v-model:loading="loading"
        v-model:error="loadError"
        :finished="finished"
        error-text="加载失败，点击重试"
        finished-text="没有更多帐单"
        class="bills-list"
        @load="loadBills"
      >
        <template v-if="groupedBills.length">
          <section v-for="group in groupedBills" :key="group.month" class="month-section">
            <header class="month-header">
              <div>
                <p class="month-header__title">{{ group.monthName }}</p>
                <span class="month-header__count">{{ group.total }} 笔记录</span>
              </div>
              <div class="month-header__stats">
                <span>收入 ¥{{ formatCurrency(group.incomeTotal) }}</span>
                <span>支出 ¥{{ formatCurrency(group.expenseTotal) }}</span>
              </div>
            </header>

            <div class="bill-rows">
              <button
                v-for="bill in group.list"
                :key="bill.id"
                class="bill-row"
                type="button"
                @click="goToBillDetail(bill)"
              >
                <span class="bill-row__badge" :class="`bill-row__badge--${bill.direction}`">
                  {{ getDirectionLabel(bill.direction) }}
                </span>

                <span class="bill-row__body">
                  <strong>{{ bill.title }}</strong>
                  <span>{{ bill.createdAt }} · {{ bill.typeName }}</span>
                </span>

                <span class="bill-row__side">
                  <strong :class="getAmountClass(bill.direction)">{{ bill.amountText }}</strong>
                  <span>{{ bill.statusName }}</span>
                </span>
              </button>
            </div>
          </section>
        </template>

        <VanEmpty v-if="firstLoaded && !billList.length" description="暂无帐单" />
      </VanList>
    </main>
  </section>
</template>

<style scoped>
.bills-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(249, 251, 248, 0.96) 0%, #eef3ef 100%),
    repeating-linear-gradient(90deg, rgba(23, 32, 28, 0.035) 0 1px, transparent 1px 18px);
  color: #17201c;
}

.bills-navbar {
  --van-nav-bar-background: rgba(255, 255, 255, 0.9);
  --van-nav-bar-icon-color: #17201c;
  --van-nav-bar-title-text-color: #17201c;
  --van-nav-bar-title-font-size: 17px;
  --van-nav-bar-z-index: 10;
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(23, 32, 28, 0.08);
}

.bills-content {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 14px 14px 28px;
  padding-top: calc(var(--van-nav-bar-height) + 14px + env(safe-area-inset-top));
}

.bills-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 92px;
  border: 1px solid rgba(27, 107, 82, 0.14);
  border-radius: 8px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 10px 28px rgba(23, 32, 28, 0.07);
}

.bills-overview__eyebrow {
  color: #1b6b52;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 16px;
  text-transform: uppercase;
}

.bills-overview h1 {
  margin: 4px 0 0;
  color: #17201c;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 32px;
}

.bills-overview__meta {
  display: grid;
  min-width: 74px;
  justify-items: end;
  gap: 2px;
}

.bills-overview__meta strong {
  color: #17201c;
  font-family: MiSans, 'DIN Alternate', 'Arial Narrow', sans-serif;
  font-size: 30px;
  font-weight: 900;
  line-height: 34px;
}

.bills-overview__meta span {
  color: #78847d;
  font-size: 12px;
  line-height: 18px;
}

.bills-list {
  margin-top: 16px;
}

.month-section + .month-section {
  margin-top: 20px;
}

.month-header {
  position: sticky;
  top: calc(var(--van-nav-bar-height) + env(safe-area-inset-top));
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 -2px 8px;
  background: rgba(238, 243, 239, 0.92);
  padding: 10px 2px 8px;
  backdrop-filter: blur(14px);
}

.month-header__title {
  margin: 0;
  color: #17201c;
  font-size: 18px;
  font-weight: 900;
  line-height: 24px;
}

.month-header__count {
  display: block;
  margin-top: 2px;
  color: #78847d;
  font-size: 12px;
  line-height: 18px;
}

.month-header__stats {
  display: grid;
  flex: 0 0 auto;
  gap: 2px;
  color: #5e6a64;
  font-size: 11px;
  line-height: 16px;
  text-align: right;
}

.bill-rows {
  display: grid;
  gap: 8px;
}

.bill-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 76px;
  border: 1px solid rgba(23, 32, 28, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  padding: 10px 12px;
  box-shadow: 0 8px 22px rgba(23, 32, 28, 0.055);
  text-align: left;
}

.bill-row:active {
  transform: scale(0.995);
}

.bill-row__badge {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 900;
}

.bill-row__badge--income {
  background: rgba(27, 107, 82, 0.1);
  color: #1b6b52;
}

.bill-row__badge--expense {
  background: rgba(172, 69, 49, 0.1);
  color: #ac4531;
}

.bill-row__body {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.bill-row__body strong {
  overflow: hidden;
  color: #17201c;
  font-size: 15px;
  font-weight: 800;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bill-row__body span {
  overflow: hidden;
  color: #78847d;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bill-row__side {
  display: grid;
  justify-items: end;
  gap: 4px;
  min-width: 84px;
}

.bill-row__side strong {
  font-family: MiSans, 'DIN Alternate', 'Arial Narrow', sans-serif;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 22px;
}

.bill-row__amount--income {
  color: #1b6b52;
}

.bill-row__amount--expense {
  color: #17201c;
}

.bill-row__side span {
  color: #8c968f;
  font-size: 11px;
  line-height: 16px;
}

@media (max-width: 360px) {
  .bills-content {
    padding-inline: 10px;
  }

  .month-header {
    align-items: flex-start;
  }

  .bill-row {
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 8px;
    padding-inline: 10px;
  }

  .bill-row__badge {
    width: 32px;
    height: 32px;
  }

  .bill-row__side {
    min-width: 76px;
  }
}
</style>
