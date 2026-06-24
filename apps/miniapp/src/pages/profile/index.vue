<script setup lang="ts">
import BottomTabBar from '@/components/BottomTabBar/index.vue';
import { useUserStore } from '@/stores/user';
import { t } from '@/utils/i18n';

const userStore = useUserStore();

userStore.restoreSession();
</script>

<template>
  <view class="tab-page page">
    <view class="profile-card">
      <view class="avatar">{{ userStore.userInfo?.nickname?.slice(0, 1) ?? t('我') }}</view>
      <view class="profile-copy">
        <text class="profile-name">{{ userStore.userInfo?.nickname ?? t('体验用户') }}</text>
        <text class="profile-meta">{{ t('当前等级') }} · {{ userStore.currentLevel }}</text>
      </view>
    </view>

    <view class="settings-list">
      <view class="settings-item">
        <text class="item-title">{{ t('账号与等级') }}</text>
        <text class="item-meta">{{ t('微信登录接入后会在这里展示账号信息。') }}</text>
      </view>
      <view class="settings-item peach">
        <text class="item-title">{{ t('学习偏好') }}</text>
        <text class="item-meta">{{ t('后续可配置默认等级、题量和练习模式。') }}</text>
      </view>
    </view>

    <BottomTabBar active="settings" />
  </view>
</template>

<style lang="scss">
.tab-page {
  min-height: 100vh;
  padding: 96px 32px 180px;
  box-sizing: border-box;
  background: #f8faf8;
}

.profile-card {
  padding: 36px;
  border-radius: 36px;
  display: flex;
  align-items: center;
  gap: 24px;
  background: #ffffff;
  border: 1px solid #d7dfdb;
  box-shadow: 0 10px 30px rgba(152, 216, 200, 0.12);
  margin-bottom: 32px;
}

.avatar {
  width: 112px;
  height: 112px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #28695c;
  background: #afefdf;
  font-size: 44px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-copy,
.settings-list,
.settings-item {
  display: flex;
  flex-direction: column;
}

.profile-copy {
  gap: 8px;
}

.profile-name {
  color: #191c1b;
  font-size: 38px;
  line-height: 50px;
  font-weight: 700;
}

.profile-meta {
  color: #3f4946;
  font-size: 26px;
  line-height: 36px;
}

.settings-list {
  gap: 20px;
}

.settings-item {
  gap: 8px;
  padding: 32px;
  border-radius: 32px;
  background: rgba(175, 239, 223, 0.35);
  border: 1px solid rgba(40, 105, 92, 0.14);
}

.settings-item.peach {
  background: rgba(254, 208, 185, 0.35);
  border-color: rgba(121, 87, 69, 0.12);
}

.item-title {
  color: #191c1b;
  font-size: 32px;
  line-height: 44px;
  font-weight: 700;
}

.item-meta {
  color: #3f4946;
  font-size: 26px;
  line-height: 40px;
}
</style>
