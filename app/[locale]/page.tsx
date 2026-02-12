'use client';

import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Globe, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COUNTRIES } from '@/lib/constants/countries';

export default function LandingPage() {
  const t = useTranslations('Landing');
  const [step, setStep] = useState<'code' | 'email'>('code');
  const [invitationCode, setInvitationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Check if user is already logged in
    import('@/lib/user-id').then(({ getUserId }) => {
      const userId = getUserId();
      if (userId) {
        window.location.href = '/dashboard';
      }
    });
  }, []);

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
      <div className="container mx-auto px-4 pt-48 pb-24 flex flex-col items-center min-h-[85vh]">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-[#1d1d1f] mb-4">
            <span dangerouslySetInnerHTML={{ __html: t.raw('title') }} />
          </h1>

          <p className="text-2xl md:text-3xl text-[#86868b] font-medium max-w-2xl mx-auto leading-relaxed tracking-tight">
            <span dangerouslySetInnerHTML={{ __html: t.raw('subtitle') }} />
          </p>

          <div className="max-w-[380px] mx-auto w-full pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
            <Card className="p-10 bg-white rounded-[28px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border-none ring-1 ring-black/5">
              {step === 'code' ? (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder={t('placeholderCode')}
                      className="w-full px-4 py-2.5 rounded-[10px] border-none bg-[#F5F5F7] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none transition-all text-[14px] placeholder:text-gray-400 text-[#1d1d1f] font-medium"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full h-[36px] bg-[#0071e3] text-white hover:bg-[#0077ED] shadow-sm text-[14px] font-medium transition-all active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? (
                      'Verify...'
                    ) : (
                      t('buttonVerify')
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder={t('placeholderEmail')}
                    className="w-full px-4 py-2.5 rounded-[10px] border-none bg-[#F5F5F7] focus:bg-white focus:ring-2 focus:ring-[#0071e3] outline-none transition-all text-[14px] placeholder:text-gray-400 text-[#1d1d1f] font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-full h-[36px] bg-[#0071e3] text-white hover:bg-[#0077ED] shadow-sm text-[14px] font-medium transition-all active:scale-[0.98]"
                    disabled={loading}
                  >
                    'Login...'
                    ) : (
                    t('buttonLogin')
                    )}
                  </Button>
                </form>
              )}
              <div className="flex items-center justify-center gap-2 mt-5 text-gray-400 text-[11px] font-medium">
                <Shield className="w-4 h-4" />
                {step === 'code' ? t('preview') : t('syncSettings')}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="h-px w-full max-w-[120px] bg-gray-200 mx-auto mb-8" />
          <p className="text-[11px] font-medium text-gray-400 tracking-widest lowercase font-mono">
            {t('footer')}
          </p>
        </div>
      </footer>
    </div >
  );
}
