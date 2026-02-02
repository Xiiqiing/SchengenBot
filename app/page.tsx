'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Globe, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COUNTRIES } from '@/lib/constants/countries';

export default function LandingPage() {
  const [step, setStep] = useState<'code' | 'email'>('code');
  const [invitationCode, setInvitationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: invitationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('email');
      } else {
        alert(data.error || '无效的邀请码');
      }
    } catch (error) {
      console.error('Verify code error:', error);
      alert('验证失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success && data.userId) {
        const { setUserId } = await import('@/lib/user-id');
        setUserId(data.userId);
        window.location.href = '/dashboard';
      } else {
        alert(data.error || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4" />
            基于 Material Design 3 的实时系统
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-on-surface mb-6">
            申根签证
            <span className="block text-primary">SLOT 通知</span>
          </h1>

          <p className="text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto leading-relaxed">
            自动化追踪申根国家签证库。{step === 'code' ? '请输入内测邀请码开启您的专属监控服务。' : '请输入邮箱同步您的监控设置与通知偏好。'}
          </p>

          <div className="max-w-md mx-auto w-full pt-8">
            <Card className="m3-card p-6 bg-surface border border-outline/20">
              {step === 'code' ? (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="邀请码"
                      className="w-full px-6 py-4 rounded-full border-2 border-outline/50 bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg font-medium placeholder:text-on-surface-variant/50"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full m3-button-pill h-14 bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-lg uppercase tracking-wider"
                    disabled={loading}
                  >
                    {loading ? (
                      <Clock className="h-6 w-6 animate-spin" />
                    ) : (
                      '立即验证'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder="您的电子邮箱"
                    className="w-full px-6 py-4 rounded-full border-2 border-outline/50 bg-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg font-medium placeholder:text-on-surface-variant/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full m3-button-pill h-14 bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <Clock className="h-6 w-6 animate-spin" />
                    ) : (
                      '进入控制中心'
                    )}
                  </Button>
                </form>
              )}
              <div className="flex items-center justify-center gap-2 mt-6 text-on-surface-variant/70 text-sm font-medium">
                <Shield className="w-4 h-4" />
                {step === 'code' ? '邀请制预览版' : '设置将自动云端同步'}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="h-px w-24 bg-outline/20 mx-auto mb-8" />
          <p className="text-sm font-medium text-on-surface-variant/60 tracking-widest lowercase">
            SCHENGEN BOT • MATERIAL DESIGN 3 • 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
