import { redirect } from 'next/navigation';

export default function DashboardRootPage() {
    // Fallback redirect in case Edge Middleware is bypassed
    redirect('/zh/dashboard');
}
