/**
 * 启动页（端自身骨架 · 占位）
 * 登录态 + 退出登录；页面内容重新构建中，后续从零填充。
 */
import { Button, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAuthStore } from '@lieshoucloud/core-web';

import { getBrandName, getEdition } from '../../config/editions';
import { bgColor, brandColor, fontSize, radius, spacing } from '../../styles/tokens';

export default function HomePage() {
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  useDidShow(() => {
    if (edition.login?.required !== false && !isAuthenticated) {
      Taro.reLaunch({ url: '/pages/login/login' });
    }
  });

  function handleLogout(): void {
    logout();
    Taro.reLaunch({ url: '/pages/login/login' });
  }

  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: bgColor,
        padding: `${spacing.xxl}px ${spacing.md}px`,
        alignItems: 'center',
      }}
    >
      <Text style={{ display: 'block', fontSize: `${fontSize.xxl}px`, fontWeight: 700, color: brandColor }}>
        {getBrandName()}
      </Text>
      <Text style={{ display: 'block', marginTop: `${spacing.sm}px`, fontSize: `${fontSize.md}px` }}>
        页面构建中…
      </Text>
      <Button
        onClick={handleLogout}
        style={{
          marginTop: `${spacing.xl}px`,
          backgroundColor: '#fff',
          color: '#8c8c8c',
          fontSize: `${fontSize.md}px`,
          borderRadius: `${radius.lg}px`,
        }}
      >
        退出登录
      </Button>
    </View>
  );
}
