# 🤖 SchengenBot (Mod)

This is a bot for real-time monitoring and notifications for Schengen visa appointments.

## ✨ Features

- **Multi-Country Support**: Supports monitoring visa appointments for multiple Schengen countries (e.g., France, Netherlands, Germany, Spain, Italy).
- **Multi-City Coverage**: Supports main cities in UK.
- **Real-Time Notifications**: Sends instant appointment slot notifications via Telegram Bot and Email.
- **Modern Dashboard**: Provides a web-based management interface for viewing status, history, and configuration settings.
- **GitHub Actions**: Utilizes `external-cron.yml` to reliably trigger Vercel Cron jobs. This ensures the appointment monitoring service runs on a strict schedule (every 15 minutes).
- **Automated Deployment**: Integrated with Vercel for continuous deployment. Pushing to the main branch automatically triggers a new build and deployment.
- **Data Management**: Uses Supabase for data persistence and user configuration management.

## 🛠️ Tech Stack

This project is built using the latest frontend and backend technologies:

- **Core Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend Service**: [Supabase](https://supabase.com/) (PostgreSQL Auth & Database)
- **Optimization**: Memory-level Request Batching (Deduplication) & API Rate Limiting (Debounce)
- **Monitoring & Resilience**: Sentry Error Tracking, User-Agent Randomization, Daily Admin Health Checks
- **Notification Service**: Telegram Bot API and resend.com API
- **Deployment**: Vercel

## ⚠️ Disclaimer

This project is inspired by and a rewrite based on [ibidi/schengen-visa-bot](https://github.com/ibidi/schengen-visa-appointment-bot).
The core functionality has been adapted and extended to support main British cities.

This project is shared purely for **educational and research purposes**, with no intention of commercial gain. Please do not use this project for illegal purposes or commercial gain. Please comply with relevant laws and regulations and the terms of use of the official appointment platforms.
