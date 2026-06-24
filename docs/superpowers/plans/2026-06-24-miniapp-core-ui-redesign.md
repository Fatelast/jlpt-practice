# JLPT 小程序核心闭环 UI 重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将登录、练习配置、做题、练习结果 4 个核心页面重构为统一的 Zenith Refresh 小程序体验。

**Architecture:** 不改后端接口和 Pinia 数据结构，复用 `useUserStore`、`usePracticeStore`、`navigation.ts`、`BottomTabBar`。先用全局 SCSS token 固定视觉语言，再逐页改模板和样式；跨页重复度不足的结构保留在页面内，避免过早抽象。

**Tech Stack:** Taro 3、Vue 3 `<script setup>`、TypeScript、Pinia、SCSS、项目内 `t('中文')` i18n 包装。

---

## File Structure

- Modify: `apps/miniapp/src/app.scss`
  - 统一页面背景、按钮 reset、交互反馈、视觉 token CSS 变量、安全区 helper。
- Modify: `apps/miniapp/src/utils/enumText.ts`
  - 修复中文乱码，供做题页复用分类文案。
- Modify: `apps/miniapp/src/components/BottomTabBar/index.vue`
  - 降低底部导航视觉权重，保留 4 个入口和当前态。
- Modify: `apps/miniapp/src/pages/login/index.vue`
  - 重构为品牌入口，继续使用 `view` 触控，规避开发者工具 touristappid 用户信息 WebAPI 红色错误。
- Modify: `apps/miniapp/src/pages/practice/index.vue`
  - 改为“今日练习面板”，加入练习摘要卡、等级/分类/模式/题量二级设置、固定 CTA 与底部导航避让。
- Modify: `apps/miniapp/src/pages/question/index.vue`
  - 改为无底部导航的专注做题页，强化顶部进度、题卡、选项状态、解析和底部操作。
- Modify: `apps/miniapp/src/pages/result/index.vue`
  - 改为结果反馈页，优化正确率圆环、统计卡、复盘提示、动作区与底部导航避让。

---

### Task 1: 全局视觉基础与乱码修复

**Files:**
- Modify: `apps/miniapp/src/app.scss`
- Modify: `apps/miniapp/src/utils/enumText.ts`

- [ ] **Step 1: 记录当前基线**

Run:

```powershell
npm --workspace apps/miniapp run typecheck
```

Expected: TypeScript 检查通过。如果失败，先记录失败输出，不在本任务里修业务逻辑。

- [ ] **Step 2: 替换全局 SCSS 基础层**

Replace `apps/miniapp/src/app.scss` with:

```scss
page {
  min-height: 100%;
  background: #f8faf8;
  color: #191c1b;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

button {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: normal;
  overflow: visible;
}

button::after {
  border: 0;
}

.page {
  --jp-bg: #f8faf8;
  --jp-surface: #ffffff;
  --jp-surface-soft: #f2f4f2;
  --jp-text: #191c1b;
  --jp-text-secondary: #3f4946;
  --jp-text-muted: #6f7976;
  --jp-primary: #28695c;
  --jp-primary-soft: #98d8c8;
  --jp-primary-faint: #afefdf;
  --jp-peach: #fed0b9;
  --jp-sand: #d6cc98;
  --jp-border: #d7dfdb;
  --jp-danger: #ba1a1a;
  --jp-danger-soft: #ffdad6;
  --jp-shadow-soft: 0 10rpx 30rpx rgba(152, 216, 200, 0.15);
  --jp-shadow-primary: 0 12rpx 32rpx rgba(40, 105, 92, 0.2);

  min-height: 100vh;
  box-sizing: border-box;
  background: var(--jp-bg);
}

.tap-feedback {
  opacity: 0.84;
  transform: scale(0.985);
}

.safe-bottom-spacer {
  padding-bottom: env(safe-area-inset-bottom);
}

.mini-card {
  border: 1rpx solid var(--jp-border);
  background: var(--jp-surface);
  box-shadow: var(--jp-shadow-soft);
}
```

- [ ] **Step 3: 修复分类文案工具**

Replace `apps/miniapp/src/utils/enumText.ts` with:

```ts
import type { QuestionCategory } from '@jlpt-practice/shared';
import { t } from '@/utils/i18n';

type Translate = (text: string) => string;

export function getQuestionCategoryText(
  category: QuestionCategory,
  translate: Translate = t,
) {
  const textMap: Record<QuestionCategory, string> = {
    moji_goi: translate('文字词汇'),
    grammar: translate('语法'),
    reading: translate('阅读'),
    listening: translate('听力'),
  };

  return textMap[category];
}
```

- [ ] **Step 4: 验证全局改动**

Run:

```powershell
npm --workspace apps/miniapp run typecheck
```

Expected: TypeScript 检查通过。

- [ ] **Step 5: Commit**

```powershell
git add apps/miniapp/src/app.scss apps/miniapp/src/utils/enumText.ts
git commit -m "refactor: 统一小程序视觉基础"
```

---

### Task 2: 底部导航降噪

**Files:**
- Modify: `apps/miniapp/src/components/BottomTabBar/index.vue`

- [ ] **Step 1: 保留导航逻辑，替换 tab 文案与图标元数据**

Keep `switchTab()` unchanged. Keep these tab entries:

```ts
const tabs: Array<{
  key: BottomTabKey;
  label: string;
  url: string;
}> = [
  { key: 'study', label: t('学习'), url: '/pages/practice/index' },
  { key: 'review', label: t('复盘'), url: '/pages/wrong-book/index' },
  { key: 'progress', label: t('进度'), url: '/pages/home/index' },
  { key: 'settings', label: t('我的'), url: '/pages/profile/index' },
];
```

- [ ] **Step 2: 替换底部导航样式**

Replace the `<style lang="scss">` block in `BottomTabBar/index.vue` with:

```scss
.bottom-tab-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  padding: 18rpx 32rpx 22rpx;
  box-sizing: border-box;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(14px);
  border-top: 1rpx solid rgba(215, 223, 219, 0.72);
}

.bottom-tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.bottom-tab-item {
  width: 25%;
  min-width: 0;
  height: 82rpx;
  border-radius: 999rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  color: var(--jp-text-muted);
  background: transparent;
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, color 180ms ease;
}

.bottom-tab-item.active {
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.72);
}

.tab-icon {
  width: 34rpx;
  height: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-label {
  font-size: 20rpx;
  line-height: 24rpx;
  font-weight: 700;
}

.icon-book {
  width: 30rpx;
  height: 24rpx;
  display: flex;
  gap: 2rpx;
}

.book-page {
  flex: 1;
  border: 3rpx solid currentColor;
  border-radius: 6rpx 3rpx 3rpx 6rpx;
  border-right-width: 1rpx;
}

.book-page.right {
  border-radius: 3rpx 6rpx 6rpx 3rpx;
  border-right-width: 3rpx;
  border-left-width: 1rpx;
}

.icon-review {
  position: relative;
  width: 30rpx;
  height: 30rpx;
}

.review-ring {
  width: 24rpx;
  height: 24rpx;
  border: 3rpx solid currentColor;
  border-radius: 999rpx;
  border-left-color: transparent;
}

.review-hand {
  position: absolute;
  left: 3rpx;
  top: 1rpx;
  width: 10rpx;
  height: 10rpx;
  border-left: 3rpx solid currentColor;
  border-bottom: 3rpx solid currentColor;
  transform: rotate(35deg);
}

.icon-progress {
  width: 30rpx;
  height: 28rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4rpx;
}

.progress-bar {
  width: 6rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.progress-bar.short {
  height: 12rpx;
}

.progress-bar.medium {
  height: 20rpx;
}

.progress-bar.tall {
  height: 28rpx;
}

.icon-settings {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid currentColor;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: currentColor;
}
```

- [ ] **Step 3: 验证底部导航类型**

Run:

```powershell
npm --workspace apps/miniapp run typecheck
```

Expected: TypeScript 检查通过。

- [ ] **Step 4: Commit**

```powershell
git add apps/miniapp/src/components/BottomTabBar/index.vue
git commit -m "refactor: 降噪小程序底部导航"
```

---

### Task 3: 登录页品牌入口重构

**Files:**
- Modify: `apps/miniapp/src/pages/login/index.vue`

- [ ] **Step 1: 保留登录逻辑**

Keep these functions unchanged:

```ts
async function enterPractice() {
  await Taro.redirectTo({ url: '/pages/practice/index' });
}

async function handleWechatLogin() {
  if (loadingType.value) {
    return;
  }

  loadingType.value = 'wechat';

  try {
    await userStore.loginWithWechat();
    await enterPractice();
  } catch (error) {
    Taro.showToast({ title: t('登录失败'), icon: 'none' });
    console.error(error);
  } finally {
    loadingType.value = '';
  }
}

async function handleGuestLogin() {
  if (loadingType.value) {
    return;
  }

  loadingType.value = 'guest';

  try {
    await userStore.loginAsGuest();
    await enterPractice();
  } catch (error) {
    Taro.showToast({ title: t('登录失败'), icon: 'none' });
    console.error(error);
  } finally {
    loadingType.value = '';
  }
}
```

- [ ] **Step 2: 替换登录页模板**

Replace the `<template>` block with:

```vue
<template>
  <view class="login-page page">
    <view class="login-canvas">
      <view class="brand-panel">
        <view class="logo-mark">
          <text class="logo-symbol">訳</text>
        </view>
        <text class="brand-kicker">{{ t('轻量日语练习') }}</text>
        <text class="brand-title">{{ t('JLPT 刷题') }}</text>
        <text class="intro-copy">
          {{ t('把每次练习、错题和收藏都沉淀下来，按自己的节奏稳定推进。') }}
        </text>
      </view>

      <view class="action-stack">
        <view
          class="primary-button"
          :class="{ disabled: Boolean(loadingType) }"
          hover-class="tap-feedback"
          @tap="handleWechatLogin"
        >
          {{ loadingType === 'wechat' ? t('登录中') : t('微信授权登录') }}
        </view>
        <view
          class="secondary-button"
          :class="{ disabled: Boolean(loadingType) }"
          hover-class="tap-feedback"
          @tap="handleGuestLogin"
        >
          {{ loadingType === 'guest' ? t('进入中') : t('暂不登录，先体验') }}
        </view>
      </view>
    </view>
  </view>
</template>
```

- [ ] **Step 3: 替换登录页样式**

Replace the `<style lang="scss">` block with:

```scss
.login-page {
  min-height: 100vh;
  padding: calc(env(safe-area-inset-top) + 92rpx) 40rpx calc(env(safe-area-inset-bottom) + 56rpx);
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background:
    linear-gradient(180deg, rgba(175, 239, 223, 0.2) 0%, rgba(248, 250, 248, 0) 34%),
    var(--jp-bg);
  text-align: center;
}

.login-canvas {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.brand-panel {
  width: 100%;
  padding-top: 104rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-mark {
  width: 168rpx;
  height: 168rpx;
  border-radius: 999rpx;
  margin-bottom: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.84);
  border: 1rpx solid var(--jp-border);
  box-shadow: var(--jp-shadow-soft);
}

.logo-symbol {
  color: var(--jp-primary);
  font-size: 72rpx;
  line-height: 80rpx;
  font-weight: 700;
}

.brand-kicker {
  color: var(--jp-text-muted);
  font-size: 24rpx;
  line-height: 34rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.brand-title {
  color: var(--jp-primary);
  font-size: 52rpx;
  line-height: 66rpx;
  font-weight: 800;
}

.intro-copy {
  width: 560rpx;
  max-width: 100%;
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  line-height: 44rpx;
  margin-top: 28rpx;
}

.action-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.primary-button,
.secondary-button {
  width: 100%;
  height: 108rpx;
  border-radius: 999rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 108rpx;
  transition: opacity 180ms ease, transform 180ms ease;
}

.primary-button {
  color: #ffffff;
  background: var(--jp-primary);
  box-shadow: var(--jp-shadow-primary);
}

.secondary-button {
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.55);
  border: 2rpx solid var(--jp-primary);
}

.primary-button.disabled,
.secondary-button.disabled {
  opacity: 0.68;
}
```

- [ ] **Step 4: 检查登录页不含原生 button**

Run:

```powershell
rg -n "<button|open-type|getUserInfo|getUserProfile" apps/miniapp/src/pages/login/index.vue
```

Expected: No matches.

- [ ] **Step 5: Commit**

```powershell
git add apps/miniapp/src/pages/login/index.vue
git commit -m "refactor: 重构小程序登录入口"
```

---

### Task 4: 练习配置页重构为今日练习面板

**Files:**
- Modify: `apps/miniapp/src/pages/practice/index.vue`

- [ ] **Step 1: 在脚本中加入摘要派生状态**

Add these computed values after `const counts`:

```ts
const currentCategory = computed(
  () => categories.find((item) => item.value === category.value) || categories[0],
);
const estimatedMinutes = computed(() => Math.max(1, Math.ceil(count.value / 6)));
const summaryItems = computed(() => [
  { label: t('等级'), value: level.value },
  { label: t('分类'), value: currentCategory.value.label },
  { label: t('题量'), value: `${count.value}${t('题')}` },
]);
```

- [ ] **Step 2: 用 `view` 替换非表单选择按钮**

In the template, use `view` for level, category, mode, and count choice controls. Keep the fixed start CTA as `button` so loading state remains available.

Example level control:

```vue
<view
  v-for="item in levels"
  :key="item.value"
  class="level-pill"
  :class="{ active: level === item.value }"
  hover-class="tap-feedback"
  @tap="level = item.value"
>
  {{ item.label }}
</view>
```

- [ ] **Step 3: 替换配置页模板主体**

Replace the `<template>` block with:

```vue
<template>
  <view class="setup-page page" :style="pageStyle">
    <view class="setup-header" :style="headerStyle">
      <view class="header-left">
        <button class="icon-button" hover-class="tap-feedback" :aria-label="t('返回')" @tap="goBack">
          ‹
        </button>
        <view class="title-stack">
          <text class="title-kicker">{{ t('今日练习') }}</text>
          <text class="setup-title">{{ t('练习配置') }}</text>
        </view>
      </view>
      <view class="avatar-dot">{{ userStore.userInfo?.nickname?.slice(0, 1) || t('练') }}</view>
    </view>

    <view class="setup-content">
      <view class="summary-card mini-card">
        <view class="summary-topline">
          <text class="summary-kicker">{{ t('本组计划') }}</text>
          <text class="summary-time">{{ estimatedMinutes }}{{ t('分钟') }}</text>
        </view>
        <text class="summary-title">{{ level }} · {{ currentCategory.label }}</text>
        <text class="summary-copy">
          {{ t('先完成一小组，再根据错题决定下一轮练习方向。') }}
        </text>
        <view class="summary-grid">
          <view v-for="item in summaryItems" :key="item.label" class="summary-item">
            <text class="summary-label">{{ item.label }}</text>
            <text class="summary-value">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon level-icon" />
          <text class="section-label">{{ t('选择等级') }}</text>
        </view>
        <view class="level-row">
          <view
            v-for="item in levels"
            :key="item.value"
            class="level-pill"
            :class="{ active: level === item.value }"
            hover-class="tap-feedback"
            @tap="level = item.value"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="setup-section">
        <view class="section-heading">
          <text class="section-icon card-icon" />
          <text class="section-label">{{ t('题目分类') }}</text>
        </view>
        <view class="category-grid">
          <view
            v-for="item in categories"
            :key="item.value"
            class="category-card"
            :class="[{ active: category === item.value }, item.tone]"
            hover-class="tap-feedback"
            @tap="category = item.value"
          >
            <view class="category-icon">{{ item.icon }}</view>
            <text class="category-title">{{ item.label }}</text>
            <text class="category-meta">{{ item.meta }}</text>
          </view>
        </view>
      </view>

      <view class="setup-section compact-section">
        <view class="section-heading">
          <text class="section-icon mode-icon" />
          <text class="section-label">{{ t('练习模式') }}</text>
        </view>
        <view class="mode-row">
          <view
            v-for="item in modes"
            :key="item.value"
            class="mode-chip"
            :class="{ active: mode === item.value, disabled: item.disabled }"
            hover-class="tap-feedback"
            @tap="selectMode(item.value, item.disabled)"
          >
            <text>{{ item.label }}</text>
            <text v-if="item.disabled" class="mode-soon">{{ t('未开放') }}</text>
          </view>
        </view>
      </view>

      <view class="setup-section compact-section">
        <view class="section-heading">
          <text class="section-icon count-icon" />
          <text class="section-label">{{ t('题目数量') }}</text>
        </view>
        <view class="count-row">
          <view
            v-for="item in counts"
            :key="item"
            class="count-toggle"
            :class="{ active: count === item }"
            hover-class="tap-feedback"
            @tap="count = item"
          >
            {{ item }}
          </view>
        </view>
      </view>
    </view>

    <view class="start-shell">
      <button class="start-button" :disabled="starting" :loading="starting" hover-class="tap-feedback" @tap="startPractice">
        {{ t('开始练习') }}
      </button>
    </view>

    <BottomTabBar active="study" />
  </view>
</template>
```

- [ ] **Step 4: 替换配置页样式**

Replace the `<style lang="scss">` block with page-specific styles that satisfy these exact constraints:

```scss
.setup-page {
  min-height: 100vh;
  padding: 128rpx 32rpx 330rpx;
  background: var(--jp-bg);
  box-sizing: border-box;
}

.setup-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(12px);
}

.header-left,
.summary-topline,
.section-heading {
  display: flex;
  align-items: center;
}

.header-left {
  gap: 22rpx;
  min-width: 0;
}

.title-stack {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.title-kicker {
  color: var(--jp-text-muted);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 700;
}

.setup-title {
  color: var(--jp-primary);
  font-size: 40rpx;
  line-height: 50rpx;
  font-weight: 800;
}

.icon-button,
.avatar-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--jp-surface-soft);
  color: var(--jp-primary);
  font-size: 34rpx;
  font-weight: 800;
  flex-shrink: 0;
  transition: opacity 180ms ease, transform 180ms ease;
}

.setup-content {
  display: flex;
  flex-direction: column;
  gap: 42rpx;
}

.summary-card {
  padding: 34rpx;
  border-radius: 36rpx;
}

.summary-topline {
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.summary-kicker,
.summary-time,
.section-label {
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 800;
}

.summary-time {
  color: var(--jp-primary);
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(175, 239, 223, 0.62);
}

.summary-title {
  display: block;
  color: var(--jp-text);
  font-size: 42rpx;
  line-height: 54rpx;
  font-weight: 800;
}

.summary-copy {
  display: block;
  color: var(--jp-text-secondary);
  font-size: 26rpx;
  line-height: 40rpx;
  margin-top: 14rpx;
}

.summary-grid {
  display: flex;
  gap: 14rpx;
  margin-top: 28rpx;
}

.summary-item {
  flex: 1;
  min-width: 0;
  padding: 18rpx 12rpx;
  border-radius: 22rpx;
  background: var(--jp-surface-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.summary-label {
  color: var(--jp-text-muted);
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 700;
}

.summary-value {
  color: var(--jp-primary);
  font-size: 28rpx;
  line-height: 34rpx;
  font-weight: 800;
}

.setup-section {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.compact-section {
  gap: 18rpx;
}

.section-heading {
  gap: 12rpx;
}

.section-icon {
  width: 20rpx;
  height: 20rpx;
  border-radius: 6rpx;
  background: var(--jp-primary);
  flex-shrink: 0;
}

.card-icon {
  background: transparent;
  border: 3rpx solid var(--jp-primary);
}

.mode-icon {
  width: 18rpx;
  height: 18rpx;
  border: 5rpx solid var(--jp-primary-soft);
  background: var(--jp-primary);
}

.count-icon {
  width: 22rpx;
  height: 22rpx;
  border-radius: 999rpx;
}

.level-row,
.mode-row,
.count-row,
.category-grid {
  display: flex;
}

.level-row,
.mode-row {
  gap: 16rpx;
  flex-wrap: wrap;
}

.level-pill,
.mode-chip,
.count-toggle,
.category-card,
.start-button {
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.level-pill,
.mode-chip {
  height: 78rpx;
  border-radius: 999rpx;
  background: #eceeec;
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  font-weight: 800;
  line-height: 78rpx;
  text-align: center;
}

.level-pill {
  flex: 1;
}

.mode-chip {
  min-width: 132rpx;
  padding: 0 22rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  line-height: 1;
}

.level-pill.active,
.mode-chip.active {
  background: var(--jp-primary);
  color: #ffffff;
  box-shadow: var(--jp-shadow-primary);
}

.mode-chip.disabled {
  color: #7d8783;
  background: var(--jp-surface-soft);
  border: 2rpx dashed var(--jp-border);
  opacity: 1;
}

.mode-soon {
  color: #8f9894;
  font-size: 18rpx;
  line-height: 24rpx;
  font-weight: 700;
}

.category-grid {
  flex-wrap: wrap;
  gap: 20rpx;
}

.category-card {
  width: calc((100% - 20rpx) / 2);
  min-height: 214rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
}

.category-card.active {
  background: var(--jp-primary-soft);
  border: 2rpx solid var(--jp-primary);
  box-shadow: var(--jp-shadow-soft);
}

.category-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 999rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jp-primary);
  background: rgba(175, 239, 223, 0.52);
  font-size: 30rpx;
  font-weight: 800;
}

.category-card.peach .category-icon {
  color: #795745;
  background: var(--jp-peach);
}

.category-card.sand .category-icon {
  color: #665f34;
  background: var(--jp-sand);
}

.category-card.active .category-icon {
  background: rgba(255, 255, 255, 0.64);
}

.category-title {
  color: var(--jp-text);
  font-size: 34rpx;
  line-height: 44rpx;
  font-weight: 800;
}

.category-meta {
  color: var(--jp-text-muted);
  font-size: 24rpx;
  line-height: 34rpx;
  margin-top: 4rpx;
}

.count-row {
  justify-content: space-between;
  gap: 16rpx;
}

.count-toggle {
  flex: 1;
  height: 104rpx;
  border-radius: 28rpx;
  background: var(--jp-surface-soft);
  color: var(--jp-text-secondary);
  border: 1rpx solid var(--jp-border);
  font-size: 34rpx;
  font-weight: 800;
  line-height: 104rpx;
  text-align: center;
}

.count-toggle.active {
  background: var(--jp-primary);
  color: #ffffff;
  border-color: var(--jp-primary);
  box-shadow: var(--jp-shadow-primary);
}

.start-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 126rpx;
  z-index: 20;
  padding: 22rpx 32rpx 28rpx;
  background: rgba(248, 250, 248, 0.94);
  backdrop-filter: blur(12px);
}

.start-button {
  width: 100%;
  height: 104rpx;
  border-radius: 999rpx;
  color: #ffffff;
  background: var(--jp-primary);
  font-size: 34rpx;
  font-weight: 800;
  line-height: 104rpx;
  box-shadow: var(--jp-shadow-primary);
}

.start-button[disabled] {
  opacity: 0.68;
}
```

- [ ] **Step 5: 验证配置页**

Run:

```powershell
npm --workspace apps/miniapp run typecheck
```

Expected: TypeScript 检查通过。

- [ ] **Step 6: Commit**

```powershell
git add apps/miniapp/src/pages/practice/index.vue
git commit -m "refactor: 重构练习配置面板"
```

---

### Task 5: 做题页专注模式重构

**Files:**
- Modify: `apps/miniapp/src/pages/question/index.vue`

- [ ] **Step 1: 使用分类文案工具**

Replace the local `categoryText` record and `getCategoryText()` function with:

```ts
import { getQuestionCategoryText } from '@/utils/enumText';

function getCategoryText(category: string) {
  return getQuestionCategoryText(category as Parameters<typeof getQuestionCategoryText>[0]);
}
```

- [ ] **Step 2: 增加选项状态文案**

Add this function near `getOptionBadge()`:

```ts
function getOptionStateText(optionKey: OptionKey) {
  if (!answerResult.value) {
    return '';
  }

  if (optionKey === answerResult.value.correctAnswer) {
    return t('正确答案');
  }

  if (optionKey === answerResult.value.selectedAnswer) {
    return t('你的选择');
  }

  return '';
}
```

- [ ] **Step 3: 替换选项模板内部结构**

Inside each `.option-card`, use:

```vue
<view class="option-badge">{{ getOptionBadge(option.key) }}</view>
<view class="option-copy">
  <text class="option-text">{{ option.text }}</text>
  <text v-if="getOptionStateText(option.key)" class="option-state">
    {{ getOptionStateText(option.key) }}
  </text>
</view>
```

- [ ] **Step 4: 替换做题页样式**

Replace the `<style lang="scss">` block with:

```scss
.question-page {
  min-height: 100vh;
  padding: 136rpx 32rpx 176rpx;
  background: var(--jp-bg);
  box-sizing: border-box;
}

.question-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 22rpx;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(12px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex-shrink: 0;
}

.close-button {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  color: var(--jp-text-secondary);
  background: var(--jp-surface-soft);
  font-size: 42rpx;
  line-height: 58rpx;
  transition: opacity 180ms ease, transform 180ms ease;
}

.brand-word {
  color: var(--jp-primary);
  font-size: 30rpx;
  line-height: 40rpx;
  font-weight: 800;
}

.progress-block {
  flex: 1;
  min-width: 0;
}

.progress-copy {
  display: flex;
  justify-content: space-between;
  color: var(--jp-text-muted);
  font-size: 20rpx;
  line-height: 28rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.progress-number {
  color: var(--jp-primary);
}

.progress-track {
  height: 12rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: var(--jp-primary-faint);
}

.progress-value {
  height: 100%;
  border-radius: 999rpx;
  background: var(--jp-primary);
  transition: width 280ms ease-out;
}

.question-main {
  display: flex;
  flex-direction: column;
  gap: 34rpx;
}

.question-card,
.analysis-card {
  padding: 38rpx;
  border-radius: 34rpx;
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
  box-shadow: var(--jp-shadow-soft);
}

.question-badge {
  align-self: flex-start;
  display: inline-flex;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  margin-bottom: 30rpx;
  color: #7a5745;
  background: var(--jp-peach);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.passage-text {
  display: block;
  color: var(--jp-text-secondary);
  font-size: 30rpx;
  line-height: 48rpx;
  margin-bottom: 30rpx;
}

.stem-text {
  display: block;
  color: var(--jp-text);
  font-size: 40rpx;
  line-height: 62rpx;
  font-weight: 800;
}

.translation-text {
  display: block;
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  line-height: 44rpx;
  margin-top: 22rpx;
}

.option-grid {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  width: 100%;
}

.option-card {
  width: 100%;
  min-height: 104rpx;
  padding: 22rpx 24rpx;
  border-radius: 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 22rpx;
  text-align: left;
  background: var(--jp-surface-soft);
  border: 1rpx solid var(--jp-border);
  transition: opacity 180ms ease, transform 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

.option-card.selected {
  background: var(--jp-primary-faint);
  border-color: var(--jp-primary);
}

.option-card.correct {
  background: var(--jp-primary-soft);
  border-color: var(--jp-primary);
}

.option-card.wrong {
  background: var(--jp-danger-soft);
  border-color: var(--jp-danger);
}

.option-card.muted {
  opacity: 0.58;
}

.option-badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--jp-text-secondary);
  background: #e1e3e1;
  font-size: 28rpx;
  font-weight: 800;
}

.option-card.correct .option-badge {
  color: #ffffff;
  background: var(--jp-primary);
}

.option-card.wrong .option-badge {
  color: #ffffff;
  background: var(--jp-danger);
}

.option-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.option-text {
  color: var(--jp-text);
  font-size: 32rpx;
  line-height: 46rpx;
}

.option-state {
  color: var(--jp-text-secondary);
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 700;
}

.analysis-card {
  background: rgba(214, 204, 152, 0.3);
  border-color: var(--jp-sand);
  box-shadow: none;
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #5d562c;
  font-size: 32rpx;
  line-height: 44rpx;
  font-weight: 800;
  margin-bottom: 14rpx;
}

.analysis-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: #665f34;
  font-size: 24rpx;
  line-height: 40rpx;
}

.analysis-text {
  color: #5d562c;
  font-size: 28rpx;
  line-height: 46rpx;
}

.question-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 22rpx 32rpx 30rpx;
  box-sizing: border-box;
  display: flex;
  gap: 18rpx;
  background: rgba(248, 250, 248, 0.94);
  backdrop-filter: blur(12px);
  border-top: 1rpx solid rgba(215, 223, 219, 0.72);
}

.ghost-action {
  width: 178rpx;
  height: 90rpx;
  border-radius: 999rpx;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid #bfc9c5;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: opacity 180ms ease, transform 180ms ease;
}

.ghost-action[disabled] {
  color: #7d8783;
  background: var(--jp-surface-soft);
  opacity: 1;
}

.favorite-mark {
  font-size: 30rpx;
  line-height: 30rpx;
}

.next-button {
  flex: 1;
  height: 90rpx;
  border-radius: 999rpx;
  color: #ffffff;
  background: var(--jp-primary);
  font-size: 32rpx;
  font-weight: 800;
  line-height: 90rpx;
  box-shadow: var(--jp-shadow-primary);
  transition: opacity 180ms ease, transform 180ms ease;
}

.next-button.disabled {
  color: rgba(255, 255, 255, 0.88);
  background: #9bbdb5;
  box-shadow: none;
  opacity: 1;
}
```

- [ ] **Step 5: 验证做题页**

Run:

```powershell
npm --workspace apps/miniapp run typecheck
```

Expected: TypeScript 检查通过。

- [ ] **Step 6: Commit**

```powershell
git add apps/miniapp/src/pages/question/index.vue
git commit -m "refactor: 重构做题页专注模式"
```

---

### Task 6: 练习结果页重构

**Files:**
- Modify: `apps/miniapp/src/pages/result/index.vue`

- [ ] **Step 1: 调整结果页动作语义**

Keep `tryAgain()` unchanged. Keep `review-button` disabled until wrong-book business logic is implemented:

```vue
<button class="review-button disabled" disabled hover-class="tap-feedback">
  <text>{{ t('复盘错题') }}</text>
  <text class="action-soon">{{ t('未开放') }}</text>
</button>
```

- [ ] **Step 2: 替换结果页样式**

Replace the `<style lang="scss">` block with:

```scss
.result-page {
  min-height: 100vh;
  padding: 128rpx 32rpx 214rpx;
  box-sizing: border-box;
  background: var(--jp-bg);
}

.result-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 0 32rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(248, 250, 248, 0.92);
  backdrop-filter: blur(12px);
}

.menu-button,
.avatar-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--jp-surface-soft);
  color: var(--jp-primary);
  font-size: 36rpx;
  font-weight: 800;
  transition: opacity 180ms ease, transform 180ms ease;
}

.result-brand {
  color: var(--jp-primary);
  font-size: 34rpx;
  line-height: 46rpx;
  font-weight: 800;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 42rpx;
}

.score-ring {
  width: 306rpx;
  height: 306rpx;
  border-radius: 999rpx;
  margin-bottom: 34rpx;
  padding: 22rpx;
  box-sizing: border-box;
  box-shadow: 0 10rpx 30rpx rgba(152, 216, 200, 0.25);
}

.score-inner {
  width: 100%;
  height: 100%;
  border-radius: 999rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--jp-bg);
}

.score-value {
  color: var(--jp-primary);
  font-size: 64rpx;
  line-height: 78rpx;
  font-weight: 800;
}

.score-label {
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 800;
}

.result-copy {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  text-align: center;
}

.result-title {
  color: var(--jp-text);
  font-size: 38rpx;
  line-height: 52rpx;
  font-weight: 800;
}

.result-subtitle {
  color: var(--jp-text-secondary);
  font-size: 28rpx;
  line-height: 44rpx;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 42rpx;
}

.stat-card {
  width: calc((100% - 20rpx) / 2);
  min-height: 168rpx;
  padding: 26rpx;
  border-radius: 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--jp-surface);
  border: 1rpx solid var(--jp-border);
}

.stat-card.peach {
  background: rgba(254, 208, 185, 0.35);
}

.stat-card.sand {
  background: rgba(214, 204, 152, 0.35);
}

.stat-mark {
  color: var(--jp-primary);
  font-size: 34rpx;
  line-height: 40rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.stat-label {
  color: var(--jp-text-secondary);
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.stat-value {
  color: var(--jp-text);
  font-size: 44rpx;
  line-height: 58rpx;
  font-weight: 800;
}

.stat-value.compact {
  font-size: 34rpx;
  line-height: 48rpx;
}

.reflection-card {
  padding: 30rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  gap: 22rpx;
  background: rgba(254, 208, 185, 0.35);
  border: 1rpx solid rgba(121, 87, 69, 0.12);
  margin-bottom: 38rpx;
}

.sprout-mark {
  width: 84rpx;
  height: 84rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.65);
  font-size: 42rpx;
  font-weight: 300;
}

.reflection-copy {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.reflection-label {
  color: #7a5745;
  font-size: 22rpx;
  line-height: 30rpx;
  font-weight: 800;
}

.reflection-text {
  color: #5f402f;
  font-size: 28rpx;
  line-height: 42rpx;
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.review-button,
.again-button {
  width: 100%;
  height: 96rpx;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 96rpx;
  transition: opacity 180ms ease, transform 180ms ease;
}

.review-button {
  color: var(--jp-primary);
  background: rgba(255, 255, 255, 0.55);
  border: 1rpx solid var(--jp-primary);
}

.review-button.disabled {
  color: #7d8783;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  line-height: 1;
  background: var(--jp-surface-soft);
  border-color: var(--jp-border);
  opacity: 1;
}

.action-soon {
  color: #8f9894;
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 700;
}

.again-button {
  color: #ffffff;
  background: var(--jp-primary);
  box-shadow: var(--jp-shadow-primary);
}
```

- [ ] **Step 3: 验证结果页**

Run:

```powershell
npm --workspace apps/miniapp run typecheck
```

Expected: TypeScript 检查通过。

- [ ] **Step 4: Commit**

```powershell
git add apps/miniapp/src/pages/result/index.vue
git commit -m "refactor: 重构练习结果页"
```

---

### Task 7: 构建验证与微信开发者工具检查

**Files:**
- Verify: `apps/miniapp/dist`
- Verify: WeChat Developer Tools import target

- [ ] **Step 1: 类型检查**

Run:

```powershell
npm --workspace apps/miniapp run typecheck
```

Expected: TypeScript 检查通过。

- [ ] **Step 2: 小程序构建**

Run:

```powershell
npm --workspace apps/miniapp run build:weapp
```

Expected: 构建完成，无 TypeScript、Vue、SCSS 编译错误。

- [ ] **Step 3: 检查登录页产物不触发用户信息开放能力**

Run:

```powershell
rg -n "getUserInfo|getUserProfile|bindgetuserinfo|open-type" apps/miniapp/dist
```

Expected: No matches.

- [ ] **Step 4: 微信开发者工具手工检查**

Open WeChat Developer Tools, compile miniapp, and verify:

```text
登录页：品牌入口居中靠上，两个操作在底部拇指区，无 Login 英文标题。
练习配置页：首屏能看到本组计划、等级、分类、题量、开始练习；底部导航不遮挡主按钮。
做题页：没有底部导航；题卡、选项、解析和底部下一题按钮不重叠。
结果页：正确率圆环、统计卡、复盘提示、再练一组依次可读；底部导航不遮挡操作。
控制台：无由本次业务代码新增的红色错误。
```

- [ ] **Step 5: Final Commit**

If all previous task commits exist, skip this step. If work was implemented in one batch, run:

```powershell
git add apps/miniapp/src/app.scss apps/miniapp/src/utils/enumText.ts apps/miniapp/src/components/BottomTabBar/index.vue apps/miniapp/src/pages/login/index.vue apps/miniapp/src/pages/practice/index.vue apps/miniapp/src/pages/question/index.vue apps/miniapp/src/pages/result/index.vue
git commit -m "refactor: 重构小程序核心练习闭环 UI"
```

---

## Self-Review

**Spec coverage**

- 登录页品牌入口：Task 3 覆盖。
- 练习配置页今日练习面板：Task 4 覆盖。
- 做题页无干扰考试工具：Task 5 覆盖。
- 结果页反馈与下一步行动：Task 6 覆盖。
- 底部导航不干扰主 CTA：Task 2、Task 4、Task 6 覆盖。
- 安全区与自定义导航：保留现有 `navigation.ts` 调用，Task 4、Task 5、Task 6 均不引入 `getSystemInfoSync()`。
- i18n 中文包裹：各任务新增中文均使用 `t('中文')`。
- 不改变 API 与数据结构：任务只改页面、样式、分类文案工具。

**Placeholder scan**

- Plan text avoids common placeholder markers and vague filler instructions.
- Disabled future features use product copy `未开放` because it is visible UI state, not plan placeholder.

**Type consistency**

- `summaryItems` reads `currentCategory.value.label` because `currentCategory` is a Vue computed ref.
- `getQuestionCategoryText` default translator is `t` and remains callable with one argument from pages.
- `BottomTabKey` values remain `study | review | progress | settings`, matching existing page usage.

