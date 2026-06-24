import Taro from '@tarojs/taro';

export interface NavigationMetrics {
  statusBarHeight: number;
  headerHeight: number;
  contentTop: number;
  rightReserved: number;
}

const DEFAULT_STATUS_BAR_HEIGHT = 24;
const DEFAULT_HEADER_HEIGHT = 88;
const DEFAULT_RIGHT_RESERVED = 104;

/**
 * 计算微信小程序自定义导航栏需要避让的系统区域。
 *
 * Context: `env(safe-area-inset-top)` 不能覆盖微信胶囊按钮的实际位置，
 * 刘海屏和模拟器都会出现标题/进度条被胶囊遮挡的问题，因此这里统一用
 * `getMenuButtonBoundingClientRect()` 作为顶部布局的事实来源。
 */
export function getNavigationMetrics(): NavigationMetrics {
  try {
    const systemInfo = Taro.getSystemInfoSync();
    const menuButton = Taro.getMenuButtonBoundingClientRect();
    const statusBarHeight = systemInfo.statusBarHeight || DEFAULT_STATUS_BAR_HEIGHT;

    if (menuButton?.top && menuButton?.height && menuButton?.bottom) {
      const verticalGap = Math.max(menuButton.top - statusBarHeight, 4);
      const headerHeight = menuButton.bottom + verticalGap;
      const windowWidth = systemInfo.windowWidth || 375;
      const rightReserved = Math.max(
        windowWidth - menuButton.left + 12,
        DEFAULT_RIGHT_RESERVED,
      );

      return {
        statusBarHeight,
        headerHeight,
        contentTop: headerHeight + 20,
        rightReserved,
      };
    }
  } catch (error) {
    console.warn('Failed to read miniapp navigation metrics.', error);
  }

  return {
    statusBarHeight: DEFAULT_STATUS_BAR_HEIGHT,
    headerHeight: DEFAULT_HEADER_HEIGHT,
    contentTop: DEFAULT_HEADER_HEIGHT + 20,
    rightReserved: DEFAULT_RIGHT_RESERVED,
  };
}
