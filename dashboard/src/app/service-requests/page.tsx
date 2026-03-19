'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getUser } from '@/lib/api';

export default function ServiceRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mechanics, setMechanics] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const user = getUser();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchRequests();
        if (isAdmin) {
            fetchMechanics();
        }
    }, [isAdmin]);

    const fetchRequests = async () => {
        try {
            const data = await apiFetch('/service-requests');
            setRequests(data.data || []);
        } catch (error) {
            console.error('Failed to fetch service requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMechanics = async () => {
        try {
            // Priority 1: Use garage ID from user object
            let garageId = user?.garage;

            // Priority 2: Fallback to fetching from API if user object doesn't have it (e.g. fresh login)
            if (!garageId) {
                const garageData = await apiFetch('/garages');
                garageId = garageData.data?.[0]?._id;
            }

            if (garageId) {
                const mechanicsData = await apiFetch(`/garages/${garageId}/mechanics`);
                setMechanics(mechanicsData.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch mechanics:', error);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await apiFetch(`/service-requests/${id}/approve`, {
                method: 'PUT',
                body: JSON.stringify({ totalCost: 0 }),
            });
            fetchRequests();
        } catch (error) {
            console.error('Failed to approve request:', error);
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason === null) return;
        try {
            await apiFetch(`/service-requests/${id}/reject`, {
                method: 'PUT',
                body: JSON.stringify({ rejectionReason: reason }),
            });
            fetchRequests();
        } catch (error) {
            console.error('Failed to reject request:', error);
        }
    };

    const openAssignModal = (request: any) => {
        setSelectedRequest(request);
        setShowAssignModal(true);
    };

    const handleAssign = async (mechanicId: string) => {
        if (!selectedRequest) return;
        setAssignLoading(true);
        try {
            await apiFetch(`/service-requests/${selectedRequest._id}/assign`, {
                method: 'PUT',
                body: JSON.stringify({ mechanicId }),
            });
            setShowAssignModal(false);
            fetchRequests();
        } catch (error) {
            console.error('Failed to assign mechanic:', error);
        } finally {
            setAssignLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const map: Record<string, string> = {
            pending: 'pending',
            approved: 'approved',
            rejected: 'rejected',
            in_progress: 'in_progress',
            completed: 'completed',
            cancelled: 'cancelled',
        };
        return map[status] || 'pending';
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <>
            <div className="page-header">
                <h1>Service Requests</h1>
                <p>Track and manage all service requests.</p>
            </div>

            <div className="data-table-container" style={{ position: 'relative' }}>
                <div className="table-header">
                    <h3>All Requests ({requests.length})</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Service Type</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Mechanic</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan={isAdmin ? 8 : 7}><div className="empty-state"><div className="icon">🔧</div><p>No service requests found</p></div></td></tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req._id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                                        {req._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        {req.customer?.fullName || '-'}
                                    </td>
                                    <td>
                                        {req.vehicle?.model || '-'}{' '}
                                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {req.vehicle?.plateNumber || ''}
                                        </span>
                                    </td>
                                    <td>{req.serviceType || '-'}</td>
                                    <td>
                                        <span className={`badge ${getStatusColor(req.status)}`}>
                                            {req.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        {req.assignedMechanic?.fullName || (
                                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button className="btn btn-success" onClick={() => handleApprove(req._id)} title="Approve">✅</button>
                                                        <button className="btn btn-danger" onClick={() => handleReject(req._id)} title="Reject">❌</button>
                                                    </>
                                                )}
                                                {(req.status === 'approved' || req.status === 'in_progress') && (
                                                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => openAssignModal(req)}>
                                                        Assign Mechanic
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Assign Mechanic Modal */}
                {showAssignModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000
                    }}>
                        <div className="chart-card" style={{ width: 450, padding: 25 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ margin: 0 }}>Assign Mechanic</h3>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 24 }}
                                >
                                    &times;
                                </button>
                            </div>

                            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                                Select a mechanic for Request #{selectedRequest?._id.slice(-6).toUpperCase()}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto', paddingRight: 5 }}>
                                {mechanics.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                                        No active mechanics found for your garage.
                                    </div>
                                ) : (
                                    mechanics.map(m => (
                                        <div
                                            key={m._id}
                                            className="stat-card"
                                            style={{
                                                padding: 15,
                                                cursor: 'pointer',
                                                border: '1px solid var(--border)',
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={() => !assignLoading && handleAssign(m._id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--accent)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {m.fullName[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{m.fullName}</div>
                                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.phoneNumber}</div>
                                                    </div>
                                                </div>
                                                <button className="btn btn-primary" style={{ padding: '5px 12px', fontSize: 12 }}>
                                                    {assignLoading && selectedRequest?.assigningTo === m._id ? '...' : 'Select'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
