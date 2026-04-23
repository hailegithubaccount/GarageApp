'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUser, logout } from '@/lib/api';
import styles from './Sidebar.module.css';

const superAdminNav = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Garages', path: '/garages', icon: '🏭' },
    { label: 'Users', path: '/users', icon: '👥' },
    { label: 'Service Requests', path: '/service-requests', icon: '🔧' },
    { label: 'Payments', path: '/payments', icon: '💳' },
    { label: 'Reviews', path: '/reviews', icon: '⭐' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
];

const adminNav = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Service Requests', path: '/service-requests', icon: '🔧' },
    { label: 'Inventory', path: '/inventory', icon: '📦' },
    { label: 'Payments', path: '/payments', icon: '💳' },
    { label: 'Reviews', path: '/reviews', icon: '⭐' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const user = getUser();
    const role = user?.role || 'admin';
    const navItems = role === 'super_admin' ? superAdminNav : adminNav;

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div className={styles.logoIcon}>🚗</div>
                <span className={styles.logoText}>GarageMS</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                    >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className={styles.bottom}>
                <button className={styles.logoutBtn} onClick={logout}>
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
