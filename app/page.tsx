'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Clock, Globe, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COUNTRIES } from '@/lib/constants/countries';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
        // Import dynamically to avoid SSR issues if any, though not strictly needed here
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
            自动追踪申根国家签证预约。输入邮箱开始使用，您的设置将自动同步。
          </p>

          <div className="max-w-md mx-auto">
            <form onSubmit={handleLogin} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="输入您的邮箱"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                size="lg"
                className="px-8"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-5 w-5" />
                    开始使用
                  </>
                )}
              </Button>
            </form>
            <p className="text-sm text-gray-500 mt-3">
              * 无需密码，新用户自动注册，老用户自动恢复设置
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            仅供教育学习目的。
          </p>
        </div>
      </footer>
    </div>
  );
}
