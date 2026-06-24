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

export function getDefaultNavigationMetrics(): NavigationMetrics {
  return {
    statusBarHeight: DEFAULT_STATUS_BAR_HEIGHT,
    headerHeight: DEFAULT_HEADER_HEIGHT,
    contentTop: DEFAULT_HEADER_HEIGHT + 20,
    rightReserved: DEFAULT_RIGHT_RESERVED,
  };
}

/**
 * 计算微信小程序自定义导航栏需要避让的系统区域。
 *
 * Context: 微信开发者工具部分基础库在页面初始化阶段调用 `getSystemInfoSync()`
 * 会触发内部 `getwxasynccainfo` 红色错误。这里只读取胶囊矩形来推导顶部高度，
 * 并保留默认值兜底，避免系统信息 API 失败影响页面渲染。
 */
export function getNavigationMetrics(): NavigationMetrics {
  try {
    const menuButton = Taro.getMenuButtonBoundingClientRect();

    if (menuButton?.top && menuButton?.height && menuButton?.bottom) {
      const statusBarHeight = Math.max(
        menuButton.top - 8,
        DEFAULT_STATUS_BAR_HEIGHT,
      );
      const verticalGap = Math.max(menuButton.top - statusBarHeight, 4);
      const headerHeight = menuButton.bottom + verticalGap;

      return {
        statusBarHeight,
        headerHeight,
        contentTop: headerHeight + 20,
        rightReserved: DEFAULT_RIGHT_RESERVED,
      };
    }
  } catch (error) {
    console.warn('Failed to read miniapp menu button metrics.', error);
  }

  return getDefaultNavigationMetrics();
}
