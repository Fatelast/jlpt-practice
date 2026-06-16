import Taro from '@tarojs/taro';

export function navigateTo(url: string) {
  return Taro.navigateTo({ url });
}
