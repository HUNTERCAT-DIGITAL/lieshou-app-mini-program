/** Taro 入口（小程序页面根容器 · 注入 core-web 端口 + 统一登录态） */
import type { PropsWithChildren } from 'react';
import {
  getStorageSync,
  navigateTo,
  redirectTo,
  removeStorageSync,
  request,
  setStorageSync,
  showToast,
  useLaunch,
} from '@tarojs/taro';
import { configureCore, useAuthStore } from '@lieshoucloud/core-web';
import {
  setAccessTokenProvider,
  setBaseUrl,
  setRequestAdapter,
  setRefreshTokensProvider,
  setUnauthorizedHandler,
} from '@lieshoucloud/contract-api';

import { API_BASE } from './config/api';

// —— contract-api 模块级单例配置（客户包若在模块级 request 上依赖它；ApiPort 走实例不受影响）——
setBaseUrl(API_BASE);
// 小程序无 fetch 全局：注入 Taro.request 适配器（web 端默认 fetch 不受影响）
setRequestAdapter(async (url, init) => {
  const res = await request({
    url,
    method: (init.method ?? 'GET') as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data: init.body,
    header: (init.headers ?? {}) as Record<string, string>,
  });
  return {
    status: res.statusCode,
    ok: res.statusCode >= 200 && res.statusCode < 300,
    json: async () => res.data,
    text: async () => (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)),
    blob: async () => {
      throw new Error('blob 不支持（小程序端）');
    },
  };
});
setAccessTokenProvider(() => useAuthStore.getState().accessToken);
setRefreshTokensProvider(async () => {
  try {
    await useAuthStore.getState().refresh();
    return true;
  } catch {
    return false;
  }
});
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

// —— 注入 core-web 端口（统一登录态/存储/通知/导航）——
configureCore({
  storage: {
    // Taro storage 同步；getStorageSync 缺省返回 ''（非 null）
    get: (k) => {
      const v = getStorageSync(k);
      return v === '' ? null : (v as string);
    },
    set: (k, v) => setStorageSync(k, v),
    remove: (k) => removeStorageSync(k),
  },
  notifier: {
    success: (m) => showToast({ title: m, icon: 'success' }),
    error: (m) => showToast({ title: m, icon: 'none' }),
  },
  navigation: {
    to: (p) => navigateTo({ url: p.startsWith('/') ? p : `/${p}` }),
    replace: (p) => redirectTo({ url: p.startsWith('/') ? p : `/${p}` }),
  },
  // HTTP 传输：小程序无 fetch，封装 Taro.request（token 注入 + 401 单飞刷新重试）
  api: {
    request: async (path, init) => {
      const method = (init?.method ?? 'GET').toUpperCase() as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'PATCH';
      const doRequest = (token?: string | null) => {
        const headers = { ...((init?.headers ?? {}) as Record<string, string>) };
        if (token) headers.Authorization = `Bearer ${token}`;
        return request({
          url: `${API_BASE}${path}`,
          method,
          data: typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : init?.body,
          header: headers,
        });
      };
      let res = await doRequest(useAuthStore.getState().accessToken);
      // 401：非认证接口 → 单飞刷新一次后重试
      if (res.statusCode === 401) {
        const skipAuth401 = (init as { skipAuth401?: boolean } | undefined)?.skipAuth401;
        if (!skipAuth401) {
          try {
            await useAuthStore.getState().refresh();
          } catch {
            useAuthStore.getState().logout();
            throw new Error('登录已过期，请重新登录');
          }
          res = await doRequest(useAuthStore.getState().accessToken);
        }
      }
      if (res.statusCode >= 400) {
        const body = (res.data ?? {}) as { message?: string };
        throw new Error(body.message ?? `请求失败 HTTP ${res.statusCode}`);
      }
      return res.data;
    },
  },
});

// core-web auth store：端口注入后显式恢复会话
void useAuthStore.persist.rehydrate();

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // eslint-disable-next-line no-console -- 启动日志（有意保留）
    console.log('[LieShouCloud Mini] App launched.');
  });
  // children 是 Taro 自动注入的页面栈
  return children;
}

export default App;
