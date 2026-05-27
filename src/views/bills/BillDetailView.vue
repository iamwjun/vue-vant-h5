<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Empty as VanEmpty, Loading as VanLoading, NavBar as VanNavBar } from 'vant'
import 'vant/es/empty/style'
import 'vant/es/loading/style'
import 'vant/es/nav-bar/style'

import { fetchWalletBillDetailApi } from '@/api/wallet'
import type { WalletBillDetail, WalletBillDirection } from '@/types'

const route = useRoute()
const router = useRouter()

const detail = ref<WalletBillDetail | null>(null)
const loading = ref(false)
const loadFailed = ref(false)

const billId = computed(() => {
  const value = route.params.id

  return Array.isArray(value) ? value[0] : value
})

const amountClass = computed(() =>
  detail.value?.direction === 'income' ? 'detail-hero__amount--income' : 'detail-hero__amount--expense',
)

const detailItems = computed(() => {
  if (!detail.value) {
    return []
  }

  return [
    { label: '帐单编号', value: detail.value.billNo },
    { label: '交易类型', value: detail.value.typeName },
    { label: '交易渠道', value: detail.value.channel },
    { label: '交易时间', value: detail.value.createdAt },
    { label: '交易门店', value: detail.value.storeName },
    { label: '操作人', value: detail.value.operator },
    { label: '交易后余额', value: `¥${formatCurrency(detail.value.balanceAfter)}` },
    { label: '备注', value: detail.value.remark },
  ]
})

function formatCurrency(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getDirectionText(direction: WalletBillDirection) {
  return direction === 'income' ? '收入' : '支出'
}

async function loadBillDetail() {
  if (!billId.value) {
    loadFailed.value = true
    return
  }

  loading.value = true
  loadFailed.value = false

  try {
    detail.value = await fetchWalletBillDetailApi(billId.value)
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadBillDetail()
})
</script>

<template>
  <section class="bill-detail-page">
    <VanNavBar
      title="帐单详情"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      class="bill-detail-navbar"
      @click-left="router.back()"
    />

    <main class="bill-detail-content">
      <div v-if="loading" class="detail-state">
        <VanLoading color="#1b6b52" size="28px" />
      </div>

      <VanEmpty v-else-if="loadFailed || !detail" description="帐单不存在" />

      <template v-else>
        <section class="detail-hero" aria-label="帐单金额">
          <span class="detail-hero__type">{{ getDirectionText(detail.direction) }} · {{ detail.typeName }}</span>
          <h1>{{ detail.title }}</h1>
          <p class="detail-hero__amount" :class="amountClass">{{ detail.amountText }}</p>
          <span class="detail-hero__status">{{ detail.statusName }}</span>
        </section>

        <section class="detail-card" aria-label="交易详情">
          <header class="detail-card__header">
            <h2>交易信息</h2>
            <span>{{ detail.date }}</span>
          </header>

          <dl class="detail-list">
            <div v-for="item in detailItems" :key="item.label" class="detail-list__row">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </section>
      </template>
    </main>
  </section>
</template>

<style scoped>
.bill-detail-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(249, 251, 248, 0.96) 0%, #eef3ef 100%),
    repeating-linear-gradient(90deg, rgba(23, 32, 28, 0.035) 0 1px, transparent 1px 18px);
  color: #17201c;
}

.bill-detail-navbar {
  --van-nav-bar-background: rgba(255, 255, 255, 0.9);
  --van-nav-bar-icon-color: #17201c;
  --van-nav-bar-title-text-color: #17201c;
  --van-nav-bar-title-font-size: 17px;
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(23, 32, 28, 0.08);
}

.bill-detail-content {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 14px 14px 28px;
}

.detail-state {
  display: grid;
  min-height: 320px;
  place-items: center;
}

.detail-hero {
  display: grid;
  gap: 8px;
  overflow: hidden;
  border: 1px solid rgba(27, 107, 82, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(142deg, rgba(27, 107, 82, 0.96), rgba(30, 71, 61, 0.96) 58%, rgba(211, 160, 76, 0.94)),
    #1b6b52;
  padding: 18px;
  box-shadow: 0 18px 44px rgba(24, 72, 55, 0.16);
  color: #fff;
}

.detail-hero__type,
.detail-hero__status {
  width: fit-content;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  padding: 4px 10px;
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  font-weight: 800;
  line-height: 18px;
}

.detail-hero h1 {
  margin: 8px 0 0;
  font-size: 18px;
  font-weight: 900;
  line-height: 26px;
}

.detail-hero__amount {
  margin: 0;
  font-family: MiSans, 'DIN Alternate', 'Arial Narrow', sans-serif;
  font-size: clamp(42px, 13vw, 58px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
}

.detail-hero__amount--income {
  color: #f7fff9;
}

.detail-hero__amount--expense {
  color: #fff6ef;
}

.detail-card {
  margin-top: 14px;
  border: 1px solid rgba(23, 32, 28, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 28px rgba(23, 32, 28, 0.07);
}

.detail-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(23, 32, 28, 0.07);
  padding: 14px 16px;
}

.detail-card__header h2 {
  margin: 0;
  color: #17201c;
  font-size: 16px;
  font-weight: 900;
  line-height: 24px;
}

.detail-card__header span {
  color: #78847d;
  font-size: 12px;
  line-height: 18px;
}

.detail-list {
  margin: 0;
  padding: 4px 16px 8px;
}

.detail-list__row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 14px;
  min-height: 46px;
  align-items: center;
  border-bottom: 1px solid rgba(23, 32, 28, 0.06);
}

.detail-list__row:last-child {
  border-bottom: 0;
}

.detail-list__row dt {
  color: #78847d;
  font-size: 13px;
  line-height: 20px;
}

.detail-list__row dd {
  margin: 0;
  color: #17201c;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
  overflow-wrap: anywhere;
  text-align: right;
}

@media (max-width: 360px) {
  .bill-detail-content {
    padding-inline: 10px;
  }

  .detail-list__row {
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 10px;
  }
}
</style>
