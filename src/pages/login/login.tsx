/**
 * 登录页（端自身骨架 · 登录态来自 core-web useAuthStore）
 * 账号 + 密码 → core-web login（POST /api/auth/login）。
 * 单租户（hideTenantInput）：隐藏租户输入框，默认租户静默使用 edition.tenantCode ?? 'default'。
 * 背景撞色对齐 mobile-web H5 登录页：上蓝（品牌白字）→ 下灰（表单白卡）。
 */
import { useEffect, useRef, useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { loginWithCode, sendCode, useAuthStore } from '@lieshoucloud/core-web';

import { getEdition } from '../../config/editions';
import { EXTRA_HOME } from '../../config/editions/extra';
import { brandColor, cardColor, fontSize, radius, spacing, statusColor, textColor } from '../../styles/tokens';

/** 记住密码本地存储 key */
const REMEMBER_KEY = 'lieshoucloud:login:remember'; // 中性 key：上游不绑定任何客户的存储命名

interface RememberedCredential {
  username: string;
  password: string;
  remember: true;
}

function loadRemembered(): RememberedCredential | null {
  try {
    const raw = Taro.getStorageSync(REMEMBER_KEY);
    if (raw && typeof raw === 'object' && (raw as RememberedCredential).remember) {
      return raw as RememberedCredential;
    }
  } catch {
    /* 存储异常忽略 */
  }
  return null;
}

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

export default function LoginPage() {
  const edition = getEdition();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  // 单租户版：默认租户静默使用（对齐 mobile-web H5）
  const [tenantCode] = useState(edition.tenantCode ?? 'default');
  // 记住密码：勾选后本地存储，下次自动填充
  const remembered = loadRemembered();
  const [remember, setRemember] = useState(remembered?.remember ?? false);
  const [username, setUsername] = useState(remembered?.username ?? '');
  const [password, setPassword] = useState(remembered?.password ?? '');
  // 登录方式：password 账号密码 / sms 短信验证码
  const [mode, setMode] = useState<'password' | 'sms'>('password');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const codeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (codeTimer.current) clearInterval(codeTimer.current);
    };
  }, []);

  function startCodeCountdown(sec = 60): void {
    setCodeCountdown(sec);
    if (codeTimer.current) clearInterval(codeTimer.current);
    codeTimer.current = setInterval(() => {
      setCodeCountdown((c) => {
        if (c <= 1) {
          if (codeTimer.current) clearInterval(codeTimer.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleSendCode(): Promise<void> {
    if (!/^1\d{10}$/.test(phone.trim())) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setSendingCode(true);
    try {
      await sendCode('SMS', phone.trim(), 'LOGIN');
      startCodeCountdown();
      Taro.showToast({ title: '验证码已发送', icon: 'success', duration: 1500 });
    } catch (e) {
      const raw = e instanceof Error ? e.message : e;
      setError(typeof raw === 'string' && raw && raw !== '[object Object]' ? raw : String(e));
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSmsLogin(): Promise<void> {
    if (!/^1\d{10}$/.test(phone.trim()) || !smsCode.trim()) {
      setError('请输入手机号和验证码');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const token = await loginWithCode(tenantCode.trim() || undefined, 'SMS', phone.trim(), smsCode.trim());
      useAuthStore.getState().setSession(token);
      Taro.reLaunch({ url: EXTRA_HOME ? `/${EXTRA_HOME.replace(/^\//, '')}` : '/pages/home/home' });
    } catch (e) {
      const raw = e instanceof Error ? e.message : e;
      setError(typeof raw === 'string' && raw && raw !== '[object Object]' ? raw : String(e));
    } finally {
      setSubmitting(false);
    }
  }
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useDidShow(() => {
    // 客户启动页（EXTRA_HOME）存在时，登录成功/免登回客户首页；否则骨架 home
    // ⚠️ reLaunch 需要绝对路由（前导 /）；EXTRA_HOME 在 pages 数组里是不带 / 的，这里补上
    const home = EXTRA_HOME ? `/${EXTRA_HOME.replace(/^\//, '')}` : '/pages/home/home';
    if (edition.login?.required === false || isAuthenticated) {
      Taro.reLaunch({ url: home });
    }
  });

  async function handleLogin(): Promise<void> {
    if (!username.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await login(username.trim(), password, tenantCode.trim() || undefined);
      // 记住密码：勾选存储 / 未勾选清除
      if (remember) {
        Taro.setStorageSync(REMEMBER_KEY, { username: username.trim(), password, remember: true } satisfies RememberedCredential);
      } else {
        Taro.removeStorageSync(REMEMBER_KEY);
      }
      Taro.reLaunch({ url: EXTRA_HOME ? `/${EXTRA_HOME.replace(/^\//, '')}` : '/pages/home/home' });
    } catch (err) {
      // 防御：错误可能是对象（后端 message 嵌套）→ 提取可读文本，避免显示 [object Object]
      const raw = err instanceof Error ? err.message : err;
      setError(typeof raw === 'string' && raw && raw !== '[object Object]' ? raw : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View
      style={{
        minHeight: '100vh',
        // 撞色：上 60% 品牌蓝（白字品牌）→ 下 40% 页面灰（白卡表单）· 对齐 H5 登录页
        backgroundImage: 'linear-gradient(160deg, #1677ff 0%, #4096ff 60%, #f5f6f7 60.1%)',
        padding: '64px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* 品牌区（蓝色区 · 白字） */}
      <View style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ display: 'block', color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1.4 }}>
          {edition.brandName}
        </Text>
        {edition.slogan ? (
          <Text style={{ display: 'block', marginTop: `${spacing.sm}px`, color: 'rgba(255,255,255,0.85)', fontSize: `${fontSize.sm}px` }}>
            {edition.slogan}
          </Text>
        ) : null}
      </View>

      {/* 表单卡（灰色区 · 白卡） */}
      <View
        style={{
          width: '100%',
          backgroundColor: cardColor,
          borderRadius: `${radius.lg}px`,
          padding: `${spacing.xl}px`,
        }}
      >
        {/* 登录方式切换 */}
        <View style={{ display: 'flex', marginBottom: `${spacing.md}px` }}>
          <View
            onClick={() => setMode('password')}
            style={{ flex: 1, textAlign: 'center', padding: `${spacing.sm}px 0`, borderRadius: `${radius.md}px`, backgroundColor: mode === 'password' ? brandColor : '#f0f0f0', marginRight: `${spacing.sm}px` }}
          >
            <Text style={{ fontSize: `${fontSize.md}px`, color: mode === 'password' ? '#fff' : textColor.secondary, fontWeight: mode === 'password' ? 600 : 400 }}>账号密码</Text>
          </View>
          <View
            onClick={() => setMode('sms')}
            style={{ flex: 1, textAlign: 'center', padding: `${spacing.sm}px 0`, borderRadius: `${radius.md}px`, backgroundColor: mode === 'sms' ? brandColor : '#f0f0f0' }}
          >
            <Text style={{ fontSize: `${fontSize.md}px`, color: mode === 'sms' ? '#fff' : textColor.secondary, fontWeight: mode === 'sms' ? 600 : 400 }}>短信验证码</Text>
          </View>
        </View>

        {mode === 'password' ? (
          <View>
            <Input
              style={inputStyle}
              value={username}
              placeholder="用户名"
              placeholderStyle={`color: ${textColor.assist}`}
              onInput={(e) => setUsername(e.detail.value)}
            />
            <Input
              style={inputStyle}
              password
              value={password}
              placeholder="密码"
              placeholderStyle={`color: ${textColor.assist}`}
              onInput={(e) => setPassword(e.detail.value)}
            />
            {/* 记住密码 + 忘记密码 */}
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${spacing.sm}px` }}>
              <View onClick={() => setRemember(!remember)} style={{ display: 'flex', alignItems: 'center' }}>
                <View
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: `${radius.sm}px`,
                    border: remember ? 'none' : '1px solid #d9d9d9',
                    backgroundColor: remember ? brandColor : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: `${spacing.xs}px`,
                  }}
                >
                  {remember ? <Text style={{ color: '#fff', fontSize: '13px', lineHeight: 1 }}>✓</Text> : null}
                </View>
                <Text style={{ fontSize: `${fontSize.sm}px`, color: textColor.secondary }}>记住密码</Text>
              </View>
              <Text
                onClick={() => Taro.navigateTo({ url: '/pages/forgot-password/index' })}
                style={{ fontSize: `${fontSize.sm}px`, color: brandColor }}
              >
                忘记密码
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <Input
              style={inputStyle}
              value={phone}
              placeholder="手机号"
              placeholderStyle={`color: ${textColor.assist}`}
              onInput={(e) => setPhone(e.detail.value)}
            />
            <View style={{ display: 'flex', marginBottom: `${spacing.md}px` }}>
              <Input
                style={{ ...inputStyle, flex: 1, marginRight: `${spacing.sm}px`, marginBottom: 0 }}
                value={smsCode}
                placeholder="验证码"
                placeholderStyle={`color: ${textColor.assist}`}
                onInput={(e) => setSmsCode(e.detail.value)}
              />
              <Button
                size="mini"
                loading={sendingCode}
                disabled={codeCountdown > 0}
                onClick={handleSendCode}
                style={{
                  margin: 0,
                  width: '120px',
                  lineHeight: '44px',
                  fontSize: `${fontSize.sm}px`,
                  backgroundColor: codeCountdown > 0 ? '#f0f0f0' : brandColor,
                  color: codeCountdown > 0 ? textColor.assist : '#fff',
                  borderRadius: `${radius.md}px`,
                }}
              >
                {codeCountdown > 0 ? `${codeCountdown}s 后重发` : '获取验证码'}
              </Button>
            </View>
          </View>
        )}

        {error ? (
          <Text style={{ display: 'block', marginBottom: `${spacing.sm}px`, fontSize: `${fontSize.sm}px`, color: statusColor.error }}>
            {error}
          </Text>
        ) : null}
        <Button
          loading={submitting}
          onClick={mode === 'password' ? handleLogin : handleSmsLogin}
          style={{
            marginTop: `${spacing.sm}px`,
            backgroundColor: brandColor,
            color: '#fff',
            fontSize: `${fontSize.lg}px`,
            fontWeight: 600,
            borderRadius: `${radius.lg}px`,
          }}
        >
          登 录
        </Button>
      </View>
    </View>
  );
}
