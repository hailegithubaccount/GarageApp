'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    const isLoginPage = pathname === '/login';

    useEffect(() => {
        const token = getToken();
        if (!token && !isLoginPage) {
            router.push('/login');
        } else {
            setReady(true);
        }
    }, [pathname, isLoginPage, router]);

    if (!ready) {
        return (
            <div className="loading-container" style={{ height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-area">
                <Header />
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
