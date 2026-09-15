/**
 * 小程序版本更新提示（仅 weapp 生效）
 *
 * 微信发布新版本后：端内 `onUpdateReady` 时提示一次「重启生效」，避免用户一直跑旧版；
 * `onUpdateFailed` 只提示重试（不阻塞启动）。H5/其它端直接跳过（getUpdateManager 不存在）。
 *
 * 由 app.tsx 的 useLaunch 调用。
 */
import Taro from '@tarojs/taro';

export function setupUpdateCheck(): void {
  if (process.env.TARO_ENV !== 'weapp') return;
  const manager = Taro.getUpdateManager?.();
  if (!manager) return;

  manager.onUpdateReady(() => {
    void Taro.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: (res) => {
        if (res.confirm) manager.applyUpdate();
      },
    });
  });

  manager.onUpdateFailed(() => {
    void Taro.showToast({ title: '新版本下载失败，请稍后重试', icon: 'none' });
  });
}
