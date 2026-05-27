<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Button as VanButton,
  Loading as VanLoading,
  NavBar as VanNavBar,
  NumberKeyboard as VanNumberKeyboard,
  showFailToast,
  showSuccessToast,
} from 'vant'
import 'vant/es/button/style'
import 'vant/es/loading/style'
import 'vant/es/nav-bar/style'
import 'vant/es/number-keyboard/style'
import 'vant/es/toast/style'

import { fetchWalletBalanceApi, submitWalletRechargeApi } from '@/api/wallet'
import type { WalletBalance } from '@/types'

const TENANT_ID = 'demo-tenant'
const MIN_RECHARGE_AMOUNT = 50
const presetAmounts = [50, 100, 200, 500, 1000, 2000]

const balance = ref<WalletBalance | null>(null)
const amountValue = ref(String(MIN_RECHARGE_AMOUNT))
const keyboardVisible = ref(false)
const balanceLoading = ref(false)
const submitting = ref(false)

const rechargeAmount = computed(() => Number(amountValue.value || 0))

const balanceText = computed(() => formatCurrency(balance.value?.balance ?? 0))

const amountText = computed(() => formatCurrency(rechargeAmount.value))

const canSubmit = computed(() => rechargeAmount.value >= MIN_RECHARGE_AMOUNT && !submitting.value)

function formatCurrency(value: number) {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function normalizeAmount(value: string) {
  const cleaned = value.replace(/[^\d.]/g, '')
  const dotIndex = cleaned.indexOf('.')
  const integerSource = dotIndex === -1 ? cleaned : cleaned.slice(0, dotIndex)
  const decimalSource = dotIndex === -1 ? '' : cleaned.slice(dotIndex + 1).replace(/\./g, '')
  const integer = integerSource.replace(/^0+(?=\d)/, '').slice(0, 6)
  const decimal = decimalSource.slice(0, 2)

  if (!cleaned) {
    return ''
  }

  if (dotIndex !== -1) {
    return `${integer || '0'}.${decimal}`
  }

  return integer || '0'
}

function selectAmount(amount: number) {
  amountValue.value = String(amount)
}

function isAmountSelected(amount: number) {
  return rechargeAmount.value === amount
}

async function loadBalance() {
  balanceLoading.value = true

  try {
    balance.value = await fetchWalletBalanceApi(TENANT_ID)
  } finally {
    balanceLoading.value = false
  }
}

async function handleRecharge() {
  if (!canSubmit.value) {
    showFailToast(`最低充值 ${MIN_RECHARGE_AMOUNT} 元`)
    return
  }

  submitting.value = true

  try {
    const result = await submitWalletRechargeApi({
      tenantId: TENANT_ID,
      amount: rechargeAmount.value,
    })

    balance.value = {
      tenantId: TENANT_ID,
      balance: result.balance,
      availableBalance: result.balance,
      frozenAmount: balance.value?.frozenAmount ?? 0,
      currency: 'CNY',
      updatedAt: result.paidAt,
    }
    keyboardVisible.value = false
    showSuccessToast('充值成功')
  } finally {
    submitting.value = false
  }
}

watch(amountValue, (value) => {
  const normalized = normalizeAmount(value)

  if (normalized !== value) {
    amountValue.value = normalized
  }
})

onMounted(() => {
  void loadBalance()
})
</script>

<template>
  <section class="recharge-page">
    <VanNavBar title="充值" fixed placeholder safe-area-inset-top class="recharge-navbar" />

    <main class="recharge-content">
      <section class="balance-panel" aria-label="账户余额">
        <div class="balance-panel__top">
          <span class="balance-panel__label">账户余额</span>
          <button class="balance-panel__refresh" type="button" :disabled="balanceLoading" @click="loadBalance">
            <VanLoading v-if="balanceLoading" size="14px" color="#1b6b52" />
            <span v-else>查询余额</span>
          </button>
        </div>

        <p class="balance-panel__amount">¥{{ balanceText }}</p>

        <div class="balance-panel__bottom">
          <span>可用余额 ¥{{ formatCurrency(balance?.availableBalance ?? 0) }}</span>
          <RouterLink class="balance-panel__link" :to="{ name: 'bills' }">查看帐单</RouterLink>
        </div>
      </section>

      <section class="recharge-section" aria-label="充值金额">
        <div class="section-heading">
          <h2>充值金额</h2>
          <span>最低 ¥{{ MIN_RECHARGE_AMOUNT }}</span>
        </div>

        <div class="amount-grid">
          <button
            v-for="amount in presetAmounts"
            :key="amount"
            class="amount-option"
            :class="{ 'amount-option--active': isAmountSelected(amount) }"
            type="button"
            @click="selectAmount(amount)"
          >
            <span class="amount-option__value">¥{{ amount }}</span>
            <span class="amount-option__caption">立即到账</span>
          </button>
        </div>

        <button class="amount-display" type="button" @click="keyboardVisible = true">
          <span class="amount-display__label">自定义金额</span>
          <span class="amount-display__value">¥{{ amountText }}</span>
        </button>
      </section>

      <VanButton
        block
        type="primary"
        class="recharge-submit"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleRecharge"
      >
        立即充值
      </VanButton>
    </main>

    <VanNumberKeyboard
      v-model="amountValue"
      :show="keyboardVisible"
      theme="custom"
      extra-key="."
      close-button-text="完成"
      :maxlength="9"
      safe-area-inset-bottom
      @blur="keyboardVisible = false"
    />
  </section>
</template>

<style scoped>
.recharge-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(246, 249, 247, 0.92) 34%, #eef3ef 100%),
    repeating-linear-gradient(135deg, rgba(27, 107, 82, 0.05) 0 1px, transparent 1px 12px);
  color: #17201c;
}

.recharge-navbar {
  --van-nav-bar-background: rgba(255, 255, 255, 0.86);
  --van-nav-bar-title-text-color: #17201c;
  --van-nav-bar-title-font-size: 17px;
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(27, 107, 82, 0.08);
}

.recharge-content {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 18px 16px 24px;
}

.balance-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(27, 107, 82, 0.16);
  border-radius: 18px;
  background:
    linear-gradient(142deg, rgba(27, 107, 82, 0.96), rgba(30, 71, 61, 0.96) 58%, rgba(211, 160, 76, 0.94)),
    #1b6b52;
  padding: 18px;
  box-shadow: 0 18px 44px rgba(24, 72, 55, 0.18);
  color: #fff;
}

.balance-panel::after {
  position: absolute;
  right: -58px;
  bottom: -72px;
  width: 180px;
  height: 180px;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 50%;
  content: '';
}

.balance-panel__top,
.balance-panel__bottom {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.balance-panel__label,
.balance-panel__bottom {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 20px;
}

.balance-panel__refresh {
  display: inline-grid;
  min-width: 72px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #1b6b52;
  font-size: 12px;
  font-weight: 700;
}

.balance-panel__refresh:disabled {
  opacity: 0.72;
}

.balance-panel__amount {
  position: relative;
  z-index: 1;
  margin: 18px 0 22px;
  font-family: MiSans, 'DIN Alternate', 'Arial Narrow', sans-serif;
  font-size: clamp(38px, 13vw, 56px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
}

.balance-panel__link {
  flex: 0 0 auto;
  border-bottom: 1px solid rgba(255, 255, 255, 0.58);
  color: #fff;
  font-weight: 700;
}

.recharge-section {
  margin-top: 18px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px 12px;
}

.section-heading h2 {
  margin: 0;
  color: #17201c;
  font-size: 18px;
  font-weight: 800;
  line-height: 26px;
}

.section-heading span {
  color: #78847d;
  font-size: 12px;
  line-height: 20px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.amount-option {
  display: grid;
  min-height: 78px;
  align-content: center;
  gap: 5px;
  border: 1px solid rgba(23, 32, 28, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #17201c;
  box-shadow: 0 8px 24px rgba(23, 32, 28, 0.06);
}

.amount-option--active {
  border-color: rgba(27, 107, 82, 0.72);
  background: #eef8f3;
  box-shadow: 0 10px 28px rgba(27, 107, 82, 0.12);
}

.amount-option__value {
  font-size: 19px;
  font-weight: 800;
  line-height: 24px;
}

.amount-option__caption {
  color: #78847d;
  font-size: 11px;
  line-height: 16px;
}

.amount-display {
  display: flex;
  width: 100%;
  min-height: 74px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  border: 1px solid rgba(27, 107, 82, 0.18);
  border-radius: 14px;
  background: #fff;
  padding: 0 16px;
  box-shadow: 0 10px 30px rgba(23, 32, 28, 0.06);
  text-align: left;
}

.amount-display__label {
  color: #5e6a64;
  font-size: 14px;
  font-weight: 700;
}

.amount-display__value {
  color: #1b6b52;
  font-family: MiSans, 'DIN Alternate', 'Arial Narrow', sans-serif;
  font-size: clamp(24px, 8vw, 34px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1;
}

.recharge-submit {
  --van-button-primary-background: #17201c;
  --van-button-primary-border-color: #17201c;
  --van-button-default-height: 52px;
  --van-button-radius: 14px;
  margin-top: 22px;
  font-size: 16px;
  font-weight: 800;
}

@media (max-width: 360px) {
  .recharge-content {
    padding-inline: 12px;
  }

  .amount-grid {
    gap: 8px;
  }

  .amount-option {
    min-height: 72px;
  }
}
</style>
