'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Clock, Globe, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { COUNTRIES } from '@/lib/constants/countries';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    // TODO: Implement auth
    window.location.href = '/dashboard';
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
            自动追踪申根国家签证预约。有可用预约时立即收到Telegram通知。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
              <Bell className="mr-2 h-5 w-5" />
              立即开始
            </Button>
          </div>
        </div>
      </div>



      {/* Countries */}
      <div className="container mx-auto px-4 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">国家</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {COUNTRIES.map((country) => (
            <div
              key={country.code}
              className="flex flex-col items-center p-4 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all"
            >
              <span className="text-4xl mb-2">{country.flag}</span>
              <span className="text-sm font-medium text-center">{country.nameTr}</span>
            </div>
          ))}
        </div>
      </div>


      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">
            Made by XQ.
          </p>
          <p className="text-sm">
            仅供教育学习目的。
          </p>
        </div>
      </footer>
    </div>
  );
}
