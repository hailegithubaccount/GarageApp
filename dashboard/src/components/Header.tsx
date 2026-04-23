'use client';

import { getUser } from '@/lib/api';
import styles from './Header.module.css';

export default function Header() {
    const user = getUser();
    const initials = user?.fullName
        ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'AD';
    const roleName = user?.role === 'super_admin' ? 'Super Admin' : 'Admin';

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h2 className={styles.greeting}>
                    {user?.fullName || 'Admin'}
                </h2>
                <p className={styles.subtitle}>Welcome Back {roleName}</p>
            </div>

            <div className={styles.right}>
                <button className={styles.iconBtn}>⚙️</button>
                <button className={styles.iconBtn}>
                    🔔
                    <span className={styles.notifDot}></span>
                </button>

                <div className={styles.profile}>
                    <div className={styles.avatar}>{initials}</div>
                    <div className={styles.profileInfo}>
                        <span className={styles.profileName}>{user?.fullName || 'System Admin'}</span>
                        <span className={styles.profileRole}>{roleName}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
