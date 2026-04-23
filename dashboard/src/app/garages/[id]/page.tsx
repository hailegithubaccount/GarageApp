'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getUser, UPLOADS_BASE } from '@/lib/api';
import AddImagesModal from '@/components/AddImagesModal';
import EditGarageModal from '@/components/EditGarageModal';

export default function GarageDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [garage, setGarage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    
    const user = getUser();
    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin';
    const isOwner = garage?.admin?._id === user?._id;
    const canManage = isSuperAdmin || (isAdmin && isOwner);

    useEffect(() => {
        if (id) {
            fetchGarageDetails();
        }
    }, [id]);

    const fetchGarageDetails = async () => {
        try {
            const data = await apiFetch(`/garages/${id}`);
            setGarage(data.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load garage details');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            const endpoint = isSuperAdmin ? `/admin/garages/${id}/approve` : `/garages/${id}/status`;
            const options = isSuperAdmin ? { method: 'PUT' } : { method: 'PUT', body: JSON.stringify({ status: 'active' }) };
            await apiFetch(endpoint, options);
            fetchGarageDetails();
        } catch (error) {
            console.error('Failed to approve/activate garage:', error);
        }
    };

    const handleSuspend = async () => {
        try {
            const endpoint = isSuperAdmin ? `/admin/garages/${id}/suspend` : `/garages/${id}/status`;
            const options = isSuperAdmin ? { method: 'PUT' } : { method: 'PUT', body: JSON.stringify({ status: 'suspended' }) };
            await apiFetch(endpoint, options);
            fetchGarageDetails();
        } catch (error) {
            console.error('Failed to suspend garage:', error);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (error) return <div className="page-content"><div className="error-msg">{error}</div><Link href="/garages" className="btn btn-outline">Back to Garages</Link></div>;
    if (!garage) return null;

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Link href="/garages" style={{ color: 'var(--text-accent)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 14 }}>
                        ← Back to Garages
                    </Link>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {garage.garageName}
                        <span className={`badge ${garage.status}`} style={{ fontSize: 12, padding: '4px 12px' }}>{garage.status}</span>
                    </h1>
                    <p style={{ marginTop: 4 }}>Owned by: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{garage.admin?.fullName || 'Unknown'}</span></p>
                </div>

                {canManage && (
                    <div style={{ display: 'flex', gap: 12 }}>
                        {isSuperAdmin && garage.status === 'pending' && (
                            <button className="btn btn-success" onClick={handleApprove}>Approve Garage</button>
                        )}
                        {garage.status === 'active' && (
                            <button className="btn btn-danger" onClick={handleSuspend}>Suspend Garage</button>
                        )}
                        {garage.status === 'suspended' && (
                            <button className="btn btn-success" onClick={handleApprove}>Activate Garage</button>
                        )}
                        
                        <button className="btn btn-outline" onClick={() => setIsImageModalOpen(true)}>
                            📸 Add Photos
                        </button>
                        <button className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}>
                            ✏️ Edit Garage
                        </button>
                    </div>
                )}
            </div>

            <div className="charts-row" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 32 }}>
                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    
                    {/* Images Section */}
                    <div className="chart-card">
                        <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            📸 Gallery
                        </h3>
                        {garage.images && garage.images.length > 0 ? (
                            <div className="gallery-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                {garage.images.map((src: string, i: number) => (
                                    <div key={i} style={{ aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                                        <img 
                                            src={src.startsWith('http') ? src : `${UPLOADS_BASE}/${src}`} 
                                            alt="" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '40px 0' }}>
                                <div className="icon">🖼️</div>
                                <p>No images uploaded for this garage</p>
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="chart-card">
                        <h3 style={{ marginBottom: 16 }}>About</h3>
                        <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                            {garage.description || 'No description provided for this garage.'}
                        </p>
                    </div>

                    {/* Services Section */}
                    <div className="chart-card">
                        <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            🛠️ Services Offered
                        </h3>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Service Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {garage.services && garage.services.length > 0 ? (
                                        garage.services.map((service: any) => (
                                            <tr key={service._id}>
                                                <td style={{ fontWeight: 600 }}>{service.serviceName}</td>
                                                <td><span className="badge" style={{ textTransform: 'capitalize', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{service.category.replace('_', ' ')}</span></td>
                                                <td style={{ color: 'var(--success)', fontWeight: 700 }}>{service.price} ETB</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{service.estimatedDuration || '-'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>
                                                No services registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="chart-card">
                        <h3 style={{ marginBottom: 20 }}>Contact Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <span style={{ fontSize: 20 }}>📍</span>
                                <div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Location</p>
                                    <p style={{ fontSize: 14 }}>{garage.location || 'Not specified'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <span style={{ fontSize: 20 }}>📞</span>
                                <div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Phone Number</p>
                                    <p style={{ fontSize: 14 }}>{garage.contactNumber || 'Not specified'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <span style={{ fontSize: 20 }}>👤</span>
                                <div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Owner Email</p>
                                    <p style={{ fontSize: 14 }}>{garage.admin?.email || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3 style={{ marginBottom: 12 }}>Ratings</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--warning)' }}>{garage.averageRating?.toFixed(1) || '0.0'}</span>
                            <div>
                                <div style={{ color: 'var(--warning)', fontSize: 18 }}>{'★'.repeat(Math.round(garage.averageRating || 0)) + '☆'.repeat(5 - Math.round(garage.averageRating || 0))}</div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Based on {garage.totalReviews || 0} reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="chart-card" style={{ background: 'var(--accent-light)', borderColor: 'var(--accent)' }}>
                        <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>Coordinates</h3>
                        <p style={{ fontSize: 13, marginBottom: 8 }}>Lat: {garage.locationCoordinates?.coordinates[1] || 'N/A'}</p>
                        <p style={{ fontSize: 13 }}>Lng: {garage.locationCoordinates?.coordinates[0] || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {isImageModalOpen && (
                <AddImagesModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    garageId={garage._id}
                    garageName={garage.garageName}
                    onSuccess={fetchGarageDetails}
                />
            )}

            {isEditModalOpen && (
                <EditGarageModal
                    isOpen={isEditModalOpen}
                    garage={garage}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={fetchGarageDetails}
                />
            )}
        </div>
    );
}
