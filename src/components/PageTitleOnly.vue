<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section
    class="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_28%),linear-gradient(180deg,#f7fbf8_0%,#edf5fb_100%)] px-4 py-6 sm:px-5"
  >
    <div
      class="w-full max-w-[30rem] rounded-[28px] border border-slate-200/80 bg-white/76 p-5 text-center shadow-[0_28px_80px_rgba(23,50,77,0.12)] backdrop-blur-xl sm:p-6"
    >
      <div
        class="w-full rounded-[24px] border border-teal-700/10 bg-white/72 px-6 py-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
      >
        <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-teal-700">当前页面</p>
        <h2
          class="mt-4 text-[clamp(2rem,8vw,2.75rem)] font-black leading-[0.98] tracking-[-0.06em] text-slate-900"
        >
          {{ title }}
        </h2>
        <p class="mx-auto mt-4 max-w-[22rem] text-sm leading-6 text-slate-600">
          当前布局由页面自身控制，容器样式继续使用 Tailwind 工具类实现。
        </p>
      </div>
    </div>
  </section>
</template>
