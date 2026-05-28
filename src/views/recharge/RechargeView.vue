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
  <section class="recharge-page-surface min-h-screen text-[#17201c]">
    <VanNavBar title="充值" fixed placeholder safe-area-inset-top
      class="border-b border-[rgba(27,107,82,0.08)] backdrop-blur-[18px] [--van-nav-bar-background:rgba(255,255,255,0.86)] [--van-nav-bar-title-font-size:17px] [--van-nav-bar-title-text-color:#17201c]" />

    <main class="mx-auto w-[min(100%,520px)] px-4 pt-4.5 pb-6 max-[360px]:px-3">
      <section
        class="recharge-balance-surface relative overflow-hidden rounded-[18px] border border-[rgba(27,107,82,0.16)] p-[18px] text-white shadow-[0_18px_44px_rgba(24,72,55,0.18)] after:absolute after:right-[-58px] after:bottom-[-72px] after:h-[180px] after:w-[180px] after:rounded-full after:border after:border-[rgba(255,255,255,0.26)] after:content-['']"
        aria-label="账户余额">
        <div class="relative z-[1] flex items-center justify-between gap-3">
          <span class="text-[13px] leading-5 text-white/78">账户余额</span>
          <button
            class="inline-grid h-[30px] min-w-[72px] place-items-center rounded-full border-0 bg-white/[0.38] text-xs font-bold text-[#1b6b52] disabled:opacity-[0.72] px-[8px]"
            type="button" :disabled="balanceLoading" @click="loadBalance">
            <VanLoading v-if="balanceLoading" size="14px" color="#1b6b52" />
            <span v-else>查询余额</span>
          </button>
        </div>

        <p
          class="relative z-[1] mt-[18px] mb-[22px] [font-family:MiSans,'DIN_Alternate','Arial_Narrow',sans-serif] text-[clamp(38px,13vw,56px)] leading-none font-extrabold">
          ¥{{ balanceText }}
        </p>

        <div class="relative z-[1] flex items-center justify-between gap-3 text-[13px] leading-5 text-white/[0.78]">
          <span>可用余额 ¥{{ formatCurrency(balance?.availableBalance ?? 0) }}</span>
          <RouterLink class="shrink-0 border-b border-white/[0.58] font-bold text-white" :to="{ name: 'bills' }">
            查看帐单
          </RouterLink>
        </div>
      </section>

      <section class="mt-[18px]" aria-label="充值金额">
        <div class="flex items-end justify-between gap-3 px-0.5 pb-3">
          <h2 class="m-0 text-lg leading-[26px] font-extrabold text-[#17201c]">充值金额</h2>
          <span class="text-xs leading-5 text-[#78847d]">最低 ¥{{ MIN_RECHARGE_AMOUNT }}</span>
        </div>

        <div class="grid grid-cols-3 gap-2.5 max-[360px]:gap-2">
          <button v-for="amount in presetAmounts" :key="amount"
            class="grid min-h-[78px] content-center gap-[5px] rounded-xl border text-[#17201c] max-[360px]:min-h-[72px]"
            :class="isAmountSelected(amount)
              ? 'border-[rgba(27,107,82,0.72)] bg-[#eef8f3] shadow-[0_10px_28px_rgba(27,107,82,0.12)]'
              : 'border-[rgba(23,32,28,0.08)] bg-white/[0.92] shadow-[0_8px_24px_rgba(23,32,28,0.06)]'
              " type="button" @click="selectAmount(amount)">
            <span class="text-[19px] leading-6 font-extrabold">¥{{ amount }}</span>
            <span class="text-[11px] leading-4 text-[#78847d]">立即到账</span>
          </button>
        </div>

        <button
          class="mt-3 flex min-h-[74px] w-full items-center justify-between gap-3 rounded-[14px] border border-[rgba(27,107,82,0.18)] bg-white px-4 text-left shadow-[0_10px_30px_rgba(23,32,28,0.06)]"
          type="button" @click="keyboardVisible = true">
          <span class="text-sm font-bold text-[#5e6a64]">自定义金额</span>
          <span
            class="[font-family:MiSans,'DIN_Alternate','Arial_Narrow',sans-serif] text-[clamp(24px,8vw,34px)] leading-none font-black text-[#1b6b52]">
            ¥{{ amountText }}
          </span>
        </button>
      </section>

      <VanButton block type="primary"
        class="mt-[22px] text-base font-extrabold [--van-button-default-height:52px] [--van-button-primary-background:#17201c] [--van-button-primary-border-color:#17201c] [--van-button-radius:14px]"
        :loading="submitting" :disabled="!canSubmit" @click="handleRecharge">
        立即充值
      </VanButton>
    </main>

    <VanNumberKeyboard v-model="amountValue" :show="keyboardVisible" theme="custom" extra-key="." close-button-text="完成"
      :maxlength="9" safe-area-inset-bottom @blur="keyboardVisible = false" />
  </section>
</template>
