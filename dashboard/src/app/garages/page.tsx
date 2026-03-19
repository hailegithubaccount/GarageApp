'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, getUser } from '@/lib/api';
import RegisterGarageModal from '@/components/RegisterGarageModal';

export default function GaragesPage() {
    const [garages, setGarages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const user = getUser();
    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchGarages();
    }, []);

    const fetchGarages = async () => {
        try {
            const endpoint = isSuperAdmin ? '/admin/garages' : (isAdmin ? '/garages/my-garages' : '/garages');
            const data = await apiFetch(endpoint);
            setGarages(data.data || []);
        } catch (error) {
            console.error('Failed to fetch garages:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Garages</h1>
                    <p>Manage all registered garages{isSuperAdmin ? ' across the platform' : ''}.</p>
                </div>
                {(isAdmin || isSuperAdmin) && (
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        Register New Garage
                    </button>
                )}
            </div>

            <div className="data-table-container">
                <div className="table-header">
                    <h3>All Garages ({garages.length})</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Preview</th>
                            <th>Garage Name</th>
                            <th>Owner</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {garages.length === 0 ? (
                            <tr><td colSpan={7}><div className="empty-state"><div className="icon">🏭</div><p>No garages found</p></div></td></tr>
                        ) : (
                            garages.map((garage) => (
                                <tr key={garage._id}>
                                    <td>
                                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                            {garage.images && garage.images.length > 0 ? (
                                                <img src={garage.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 18 }}>🏭</div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{garage.garageName}</td>
                                    <td>{garage.admin?.fullName || '-'}</td>
                                    <td>{garage.contactNumber || '-'}</td>
                                    <td>{garage.location || '-'}</td>
                                    <td>
                                         <span className={`badge ${garage.status}`}>{garage.status}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <Link 
                                                href={`/garages/${garage._id}`}
                                                className="btn btn-outline"
                                                style={{ padding: '6px 10px' }}
                                                title="View Details"
                                            >
                                                👁️ View Details
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RegisterGarageModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchGarages} 
            />
        </>
    );
}
