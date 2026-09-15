/**
 * 空态 / 加载 / 错误 三态 —— 对齐 mobile-info-flow §8.
 */
import { Text, View } from '@tarojs/components';
import { fontSize, radius, spacing, textColor } from '../styles/tokens';

/** 加载态（页面级/区块级） */
export function LoadingView({ text = '加载中…' }: { text?: string }) {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${spacing.xxl}px 0`,
      }}
    >
      <Text style={{ fontSize: `${fontSize.md}px`, color: textColor.secondary }}>{text}</Text>
    </View>
  );
}

/** 空态：图标 + 引导文案 */
export function EmptyState({ icon = '📭', text = '暂无数据' }: { icon?: string; text?: string }) {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${spacing.xxl}px 0`,
      }}
    >
      <Text style={{ fontSize: `${fontSize.xl}px`, marginBottom: `${spacing.sm}px` }}>{icon}</Text>
      <Text style={{ fontSize: `${fontSize.md}px`, color: textColor.secondary }}>{text}</Text>
    </View>
  );
}

/** 错误态：错误文案 + 重试按钮 */
export function ErrorView({ text = '加载失败', onRetry }: { text?: string; onRetry?: () => void }) {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${spacing.xxl}px 0`,
      }}
    >
      <Text style={{ fontSize: `${fontSize.md}px`, color: textColor.secondary }}>{text}</Text>
      {onRetry ? (
        <View
          onClick={onRetry}
          style={{
            marginTop: `${spacing.md}px`,
            padding: `${spacing.sm}px ${spacing.xl}px`,
            borderRadius: `${radius.lg}px`,
            backgroundColor: '#1677ff',
          }}
        >
          <Text style={{ fontSize: `${fontSize.md}px`, color: '#fff' }}>重试</Text>
        </View>
      ) : null}
    </View>
  );
}
