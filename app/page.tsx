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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            实时通知系统
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            申根签证查询
            <span className="block text-blue-600">SLOT</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            自动追踪申根国家签证预约。{step === 'code' ? '验证邀请码开始使用。' : '输入邮箱完成登录。'}
          </p>

          <div className="max-w-md mx-auto">
            {step === 'code' ? (
              <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="输入邀请码"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="px-8"
                  disabled={loading}
                >
                  {loading ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    '验证'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="输入您的邮箱"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <Button
                  type="submit"
                  size="lg"
                  className="px-8"
                  disabled={loading}
                >
                  {loading ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    '进入后台'
                  )}
                </Button>
              </form>
            )}
            <p className="text-sm text-gray-500 mt-3">
              {step === 'code' ? '* 需拥有内测邀请码' : '* 邮箱将用于同步您的设置'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            仅供教育学习目的。
          </p>
        </div>
      </footer>
    </div>
  );
}
