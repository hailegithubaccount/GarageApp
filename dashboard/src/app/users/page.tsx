'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getUser } from '@/lib/api';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const user = getUser();
    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = roleFilter ? `?role=${roleFilter}` : '';
            const data = await apiFetch(`/admin/users${query}`);
            setUsers(data.data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (userId: string, status: string) => {
        try {
            await apiFetch(`/admin/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const roles = ['', 'customer', 'mechanic', 'admin', 'super_admin'];

    if (!isSuperAdmin) {
        return (
            <div className="page-header">
                <h1>Users</h1>
                <p>Only Super Admins can manage users.</p>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <h1>Users</h1>
                <p>Manage all platform users.</p>
            </div>

            <div className="data-table-container">
                <div className="table-header">
                    <h3>All Users ({users.length})</h3>
                    <div className="table-actions">
                        <select
                            className="input"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            {roles.map(r => (
                                <option key={r} value={r}>{r ? r.replace('_', ' ').toUpperCase() : 'All Roles'}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container"><div className="spinner"></div></div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={6}><div className="empty-state"><div className="icon">👥</div><p>No users found</p></div></td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                                        <td>{u.email}</td>
                                        <td>{u.phoneNumber || '-'}</td>
                                        <td>
                                            <span className="badge active" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
                                                {u.role?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td><span className={`badge ${u.status}`}>{u.status}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {u.status !== 'active' && (
                                                    <button className="btn btn-success" onClick={() => handleStatusUpdate(u._id, 'active')}>Activate</button>
                                                )}
                                                {u.status === 'active' && (
                                                    <button className="btn btn-danger" onClick={() => handleStatusUpdate(u._id, 'suspended')}>Suspend</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
