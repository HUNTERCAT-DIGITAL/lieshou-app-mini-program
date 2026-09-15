/**
 * 忘记密码页（端自身骨架 · 验证码重置密码）
 * 渠道（短信/邮箱）+ 获取验证码（sendCode）→ 验证码 + 新密码 → resetPassword。
 * API：@lieshoucloud/core-web sendCode / resetPassword。
 */
import { Button, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';
import { resetPassword, sendCode, type CodeChannel } from '@lieshoucloud/core-web';

import { getEdition } from '../../config/editions';
import { brandColor, cardColor, fontSize, radius, spacing, statusColor, textColor } from '../../styles/tokens';

const inputStyle = {
  height: '44px',
  padding: `0 ${spacing.md}px`,
  marginBottom: `${spacing.md}px`,
  borderRadius: `${radius.md}px`,
  border: '1px solid #e5e5e5',
  backgroundColor: cardColor,
  fontSize: `${fontSize.md}px`,
  color: textColor.main,
} as const;

export default function ForgotPasswordPage() {
  const [channel, setChannel] = useState<CodeChannel>('SMS');
  const [target, setTarget] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function startCountdown(sec = 60): void {
    setCountdown(sec);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSendCode(): Promise<void> {
    if (!target.trim()) {
      setError(channel === 'SMS' ? '请输入手机号' : '请输入邮箱');
      return;
    }
    setError('');
    setSending(true);
    try {
      await sendCode(channel, target.trim(), 'RESET_PASSWORD');
      startCountdown();
      Taro.showToast({ title: '验证码已发送', icon: 'success', duration: 1500 });
    } catch (e) {
      const raw = e instanceof Error ? e.message : e;
      setError(typeof raw === 'string' && raw ? raw : '发送失败，请重试');
    } finally {
      setSending(false);
    }
  }

  async function handleReset(): Promise<void> {
    if (!target.trim() || !code.trim()) {
      setError('请输入手机号/邮箱和验证码');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('新密码至少 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // tenantCode 为首参（多租户 ADR-0022）：与 login 页一致走 edition.tenantCode
      await resetPassword(getEdition().tenantCode, channel, target.trim(), code.trim(), newPassword);
      Taro.showToast({ title: '密码重置成功，请登录', icon: 'success', duration: 1800 });
      setTimeout(() => Taro.reLaunch({ url: '/pages/login/login' }), 1500);
    } catch (e) {
      const raw = e instanceof Error ? e.message : e;
      setError(typeof raw === 'string' && raw && raw !== '[object Object]' ? raw : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  const channelBtn = (c: CodeChannel, label: string) => (
    <View
      key={c}
      onClick={() => setChannel(c)}
      style={{
        flex: 1,
        textAlign: 'center',
        padding: `${spacing.sm}px 0`,
        borderRadius: `${radius.md}px`,
        backgroundColor: channel === c ? brandColor : '#f0f0f0',
        marginRight: c === 'SMS' ? `${spacing.sm}px` : 0,
      }}
    >
      <Text style={{ fontSize: `${fontSize.md}px`, color: channel === c ? '#fff' : textColor.secondary, fontWeight: channel === c ? 600 : 400 }}>
        {label}
      </Text>
    </View>
  );

  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(160deg, #1677ff 0%, #4096ff 60%, #f5f6f7 60.1%)',
        padding: '64px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <View style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ display: 'block', color: '#fff', fontSize: '26px', fontWeight: 700, lineHeight: 1.4 }}>忘记密码</Text>
        <Text style={{ display: 'block', marginTop: `${spacing.sm}px`, color: 'rgba(255,255,255,0.85)', fontSize: `${fontSize.sm}px` }}>
          验证码重置，找回后请妥善保管
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          backgroundColor: cardColor,
          borderRadius: `${radius.lg}px`,
          padding: `${spacing.xl}px`,
        }}
      >
        {/* 渠道切换 */}
        <View style={{ display: 'flex', marginBottom: `${spacing.md}px` }}>
          {channelBtn('SMS', '短信')}
          {channelBtn('EMAIL', '邮箱')}
        </View>

        <Input
          style={inputStyle}
          value={target}
          placeholder={channel === 'SMS' ? '手机号' : '邮箱'}
          placeholderStyle={`color: ${textColor.assist}`}
          onInput={(e) => setTarget(e.detail.value)}
        />

        {/* 验证码 + 获取 */}
        <View style={{ display: 'flex', marginBottom: `${spacing.md}px` }}>
          <Input
            style={{ ...inputStyle, flex: 1, marginRight: `${spacing.sm}px`, marginBottom: 0 }}
            value={code}
            placeholder="验证码"
            placeholderStyle={`color: ${textColor.assist}`}
            onInput={(e) => setCode(e.detail.value)}
          />
          <Button
            size="mini"
            loading={sending}
            disabled={countdown > 0}
            onClick={handleSendCode}
            style={{
              margin: 0,
              width: '110px',
              lineHeight: '44px',
              fontSize: `${fontSize.sm}px`,
              backgroundColor: countdown > 0 ? '#f0f0f0' : brandColor,
              color: countdown > 0 ? textColor.assist : '#fff',
              borderRadius: `${radius.md}px`,
            }}
          >
            {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
          </Button>
        </View>

        <Input
          style={inputStyle}
          password
          value={newPassword}
          placeholder="新密码（至少 6 位）"
          placeholderStyle={`color: ${textColor.assist}`}
          onInput={(e) => setNewPassword(e.detail.value)}
        />
        <Input
          style={inputStyle}
          password
          value={confirmPassword}
          placeholder="确认新密码"
          placeholderStyle={`color: ${textColor.assist}`}
          onInput={(e) => setConfirmPassword(e.detail.value)}
        />

        {error ? (
          <Text style={{ display: 'block', marginBottom: `${spacing.sm}px`, fontSize: `${fontSize.sm}px`, color: statusColor.error }}>
            {error}
          </Text>
        ) : null}

        <Button
          loading={submitting}
          onClick={handleReset}
          style={{
            marginTop: `${spacing.sm}px`,
            backgroundColor: brandColor,
            color: '#fff',
            fontSize: `${fontSize.lg}px`,
            fontWeight: 600,
            borderRadius: `${radius.lg}px`,
          }}
        >
          重置密码
        </Button>
        <View style={{ textAlign: 'center', marginTop: `${spacing.md}px` }}>
          <Text onClick={() => Taro.reLaunch({ url: '/pages/login/login' })} style={{ fontSize: `${fontSize.sm}px`, color: textColor.secondary }}>
            返回登录
          </Text>
        </View>
      </View>
    </View>
  );
}
