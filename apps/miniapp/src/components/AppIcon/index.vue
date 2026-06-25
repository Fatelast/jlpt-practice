<script setup lang="ts">
export type AppIconName =
  | 'book'
  | 'chart'
  | 'check'
  | 'clock'
  | 'home'
  | 'layers'
  | 'menu'
  | 'pen'
  | 'review'
  | 'spark'
  | 'target'
  | 'user';

withDefaults(defineProps<{
  name: AppIconName;
}>(), {});
</script>

<template>
  <view class="app-icon" :class="`app-icon-${name}`" aria-hidden="true">
    <template v-if="name === 'home'">
      <view class="home-roof" />
      <view class="home-body" />
      <view class="home-door" />
    </template>
    <template v-else-if="name === 'book'">
      <view class="book-page left" />
      <view class="book-spine" />
      <view class="book-page right" />
    </template>
    <template v-else-if="name === 'review'">
      <view class="review-ring" />
      <view class="review-arrow" />
      <view class="review-dot" />
    </template>
    <template v-else-if="name === 'chart'">
      <view class="chart-axis" />
      <view class="chart-bar short" />
      <view class="chart-bar medium" />
      <view class="chart-bar tall" />
    </template>
    <template v-else-if="name === 'user'">
      <view class="user-head" />
      <view class="user-body" />
    </template>
    <template v-else-if="name === 'menu'">
      <view class="menu-line top" />
      <view class="menu-line middle" />
      <view class="menu-line bottom" />
    </template>
    <template v-else-if="name === 'pen'">
      <view class="pen-body" />
      <view class="pen-tip" />
      <view class="pen-mark" />
    </template>
    <template v-else-if="name === 'spark'">
      <view class="spark-main vertical" />
      <view class="spark-main horizontal" />
      <view class="spark-small one" />
      <view class="spark-small two" />
    </template>
    <template v-else-if="name === 'target'">
      <view class="target-ring outer" />
      <view class="target-ring inner" />
      <view class="target-dot" />
    </template>
    <template v-else-if="name === 'clock'">
      <view class="clock-ring" />
      <view class="clock-hand hour" />
      <view class="clock-hand minute" />
    </template>
    <template v-else-if="name === 'check'">
      <view class="check-line short" />
      <view class="check-line long" />
    </template>
    <template v-else>
      <view class="layers-card back" />
      <view class="layers-card front" />
    </template>
  </view>
</template>

<style lang="scss">
.app-icon {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  color: currentColor;
  flex-shrink: 0;
}

.app-icon view {
  box-sizing: border-box;
}

.home-roof {
  position: absolute;
  left: 11rpx;
  top: 9rpx;
  width: 27rpx;
  height: 27rpx;
  border-left: 4rpx solid currentColor;
  border-top: 4rpx solid currentColor;
  border-radius: 4rpx 0 0 0;
  transform: rotate(45deg);
}

.home-body {
  position: absolute;
  left: 12rpx;
  top: 22rpx;
  width: 24rpx;
  height: 19rpx;
  border: 4rpx solid currentColor;
  border-top: 0;
  border-radius: 0 0 6rpx 6rpx;
}

.home-door {
  position: absolute;
  left: 22rpx;
  top: 30rpx;
  width: 7rpx;
  height: 11rpx;
  border-radius: 4rpx 4rpx 0 0;
  background: currentColor;
}

.book-page {
  position: absolute;
  top: 10rpx;
  width: 17rpx;
  height: 27rpx;
  border: 4rpx solid currentColor;
  background: transparent;
}

.book-page.left {
  left: 6rpx;
  border-radius: 8rpx 3rpx 3rpx 8rpx;
}

.book-page.right {
  right: 6rpx;
  border-radius: 3rpx 8rpx 8rpx 3rpx;
}

.book-spine {
  position: absolute;
  left: 22rpx;
  top: 12rpx;
  width: 4rpx;
  height: 25rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.review-ring {
  position: absolute;
  left: 9rpx;
  top: 8rpx;
  width: 30rpx;
  height: 30rpx;
  border: 4rpx solid currentColor;
  border-left-color: transparent;
  border-radius: 999rpx;
}

.review-arrow {
  position: absolute;
  left: 7rpx;
  top: 13rpx;
  width: 13rpx;
  height: 13rpx;
  border-left: 4rpx solid currentColor;
  border-bottom: 4rpx solid currentColor;
  transform: rotate(33deg);
}

.review-dot {
  position: absolute;
  right: 10rpx;
  bottom: 9rpx;
  width: 5rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.chart-axis {
  position: absolute;
  left: 8rpx;
  bottom: 8rpx;
  width: 34rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: currentColor;
  opacity: 0.45;
}

.chart-bar {
  position: absolute;
  bottom: 12rpx;
  width: 7rpx;
  border-radius: 999rpx 999rpx 3rpx 3rpx;
  background: currentColor;
}

.chart-bar.short {
  left: 12rpx;
  height: 12rpx;
}

.chart-bar.medium {
  left: 22rpx;
  height: 20rpx;
}

.chart-bar.tall {
  left: 32rpx;
  height: 29rpx;
}

.user-head {
  position: absolute;
  left: 16rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border: 4rpx solid currentColor;
  border-radius: 999rpx;
}

.user-body {
  position: absolute;
  left: 10rpx;
  top: 29rpx;
  width: 28rpx;
  height: 13rpx;
  border: 4rpx solid currentColor;
  border-radius: 16rpx 16rpx 8rpx 8rpx;
}

.menu-line {
  position: absolute;
  left: 10rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.menu-line.top {
  top: 13rpx;
  width: 28rpx;
}

.menu-line.middle {
  top: 23rpx;
  width: 22rpx;
}

.menu-line.bottom {
  top: 33rpx;
  width: 30rpx;
}

.pen-body {
  position: absolute;
  left: 14rpx;
  top: 8rpx;
  width: 10rpx;
  height: 30rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform: rotate(41deg);
}

.pen-tip {
  position: absolute;
  right: 10rpx;
  bottom: 8rpx;
  width: 0;
  height: 0;
  border-left: 6rpx solid transparent;
  border-right: 6rpx solid transparent;
  border-top: 10rpx solid currentColor;
  transform: rotate(41deg);
}

.pen-mark {
  position: absolute;
  left: 8rpx;
  bottom: 9rpx;
  width: 17rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: currentColor;
  opacity: 0.45;
}

.spark-main {
  position: absolute;
  left: 22rpx;
  top: 7rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.spark-main.vertical {
  width: 4rpx;
  height: 34rpx;
}

.spark-main.horizontal {
  left: 7rpx;
  top: 22rpx;
  width: 34rpx;
  height: 4rpx;
}

.spark-small {
  position: absolute;
  width: 7rpx;
  height: 7rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.spark-small.one {
  right: 6rpx;
  top: 8rpx;
}

.spark-small.two {
  left: 7rpx;
  bottom: 7rpx;
}

.target-ring {
  position: absolute;
  border: 4rpx solid currentColor;
  border-radius: 999rpx;
}

.target-ring.outer {
  left: 7rpx;
  top: 7rpx;
  width: 34rpx;
  height: 34rpx;
}

.target-ring.inner {
  left: 16rpx;
  top: 16rpx;
  width: 16rpx;
  height: 16rpx;
  border-width: 3rpx;
}

.target-dot {
  position: absolute;
  left: 22rpx;
  top: 22rpx;
  width: 5rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.clock-ring {
  position: absolute;
  left: 8rpx;
  top: 8rpx;
  width: 32rpx;
  height: 32rpx;
  border: 4rpx solid currentColor;
  border-radius: 999rpx;
}

.clock-hand {
  position: absolute;
  left: 23rpx;
  top: 23rpx;
  width: 4rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform-origin: top center;
}

.clock-hand.hour {
  height: 10rpx;
  transform: rotate(180deg);
}

.clock-hand.minute {
  height: 12rpx;
  transform: rotate(270deg);
}

.check-line {
  position: absolute;
  height: 5rpx;
  border-radius: 999rpx;
  background: currentColor;
  transform-origin: left center;
}

.check-line.short {
  left: 11rpx;
  top: 27rpx;
  width: 12rpx;
  transform: rotate(42deg);
}

.check-line.long {
  left: 20rpx;
  top: 32rpx;
  width: 25rpx;
  transform: rotate(-47deg);
}

.layers-card {
  position: absolute;
  width: 29rpx;
  height: 21rpx;
  border: 4rpx solid currentColor;
  border-radius: 7rpx;
}

.layers-card.back {
  left: 8rpx;
  top: 10rpx;
  opacity: 0.45;
}

.layers-card.front {
  left: 12rpx;
  top: 17rpx;
}
</style>
