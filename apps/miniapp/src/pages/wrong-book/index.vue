<script setup lang="ts">
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { t } from '@/utils/i18n';
</script>

<template>
  <view class="tab-page page">
    <view class="page-hero">
      <text class="eyebrow">{{ t('复盘') }}</text>
      <text class="hero-title">{{ t('错题会在这里集中整理') }}</text>
      <text class="hero-copy">
        {{ t('完成更多练习后，可以回到这里按题型复盘薄弱点。') }}
      </text>
    </view>

    <view class="empty-card">
      <view class="empty-mark">
        <view class="mark-line" />
        <view class="mark-line short" />
      </view>
      <text class="empty-title">{{ t('错题本开发中') }}</text>
      <text class="empty-copy">
        {{ t('当前先保留入口，后续会接入错题筛选、重新练习和收藏题。') }}
      </text>
    </view>

    <BottomTabBar active="review" />
  </view>
</template>

<style lang="scss">
.tab-page {
  min-height: 100vh;
  padding: 96px 32px 180px;
  box-sizing: border-box;
  background: #f8faf8;
}

.page-hero {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 40px;
}

.eyebrow {
  color: #28695c;
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
}

.hero-title {
  color: #191c1b;
  font-size: 46px;
  line-height: 60px;
  font-weight: 700;
}

.hero-copy,
.empty-copy {
  color: #3f4946;
  font-size: 28px;
  line-height: 44px;
}

.empty-card {
  min-height: 420px;
  padding: 40px;
  border-radius: 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #d7dfdb;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.12);
}

.empty-mark {
  width: 112px;
  height: 112px;
  border-radius: 999px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #28695c;
  background: rgba(175, 239, 223, 0.45);
}

.mark-line {
  width: 48px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}

.mark-line.short {
  width: 32px;
}

.empty-title {
  color: #191c1b;
  font-size: 34px;
  line-height: 46px;
  font-weight: 700;
}
</style>
