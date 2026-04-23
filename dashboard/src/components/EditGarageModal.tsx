'use client';

import { useState, useRef, useEffect } from 'react';
import { apiFetch, UPLOADS_BASE } from '@/lib/api';

interface EditGarageModalProps {
    isOpen: boolean;
    onClose: () => void;
    garage: any;
    onSuccess: () => void;
}

export default function EditGarageModal({ isOpen, onClose, garage, onSuccess }: EditGarageModalProps) {
    const [formData, setFormData] = useState({
        garageName: '',
        location: '',
        contactNumber: '',
        description: '',
        latitude: '',
        longitude: ''
    });
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (garage) {
            setFormData({
                garageName: garage.garageName || '',
                location: garage.location || '',
                contactNumber: garage.contactNumber || '',
                description: garage.description || '',
                latitude: garage.locationCoordinates?.coordinates[1] || '',
                longitude: garage.locationCoordinates?.coordinates[0] || ''
            });
            setExistingImages(garage.images || []);
        }
    }, [garage]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeExistingImage = async (url: string) => {
        try {
            await apiFetch(`/garages/${garage._id}/images`, {
                method: 'DELETE',
                body: JSON.stringify({ imageUrl: url })
            });
            setExistingImages(prev => prev.filter(img => img !== url));
        } catch (err: any) {
            setError(err.message || 'Failed to remove image');
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Update basic info
            await apiFetch(`/garages/${garage._id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...formData,
                    locationCoordinates: {
                        type: 'Point',
                        coordinates: [Number(formData.longitude), Number(formData.latitude)]
                    }
                })
            });

            // 2. Upload new images if any
            if (newImages.length > 0) {
                const imgFormData = new FormData();
                newImages.forEach(img => imgFormData.append('garageImages', img));
                await apiFetch(`/garages/${garage._id}/upload-images`, {
                    method: 'POST',
                    body: imgFormData
                });
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update garage');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>Edit Garage: {garage?.garageName}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-msg">{error}</div>}
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Garage Name</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={formData.garageName}
                                    onChange={e => setFormData({...formData, garageName: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    value={formData.contactNumber}
                                    onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Location Address</label>
                            <input 
                                type="text" 
                                className="form-control"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Latitude</label>
                                <input 
                                    type="number" step="any"
                                    className="form-control"
                                    value={formData.latitude}
                                    onChange={e => setFormData({...formData, latitude: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Longitude</label>
                                <input 
                                    type="number" step="any"
                                    className="form-control"
                                    value={formData.longitude}
                                    onChange={e => setFormData({...formData, longitude: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                className="form-control"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                rows={3}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Existing Images</label>
                            <div className="preview-grid" style={{ marginTop: 8 }}>
                                {existingImages.map((src, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={src.startsWith('http') ? src : `${UPLOADS_BASE}/${src}`} alt="" />
                                        <button type="button" className="remove" onClick={() => removeExistingImage(src)} title="Delete from server">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Add New Images</label>
                            <div className="image-upload-area" onClick={() => fileInputRef.current?.click()} style={{ padding: '20px' }}>
                                <span className="icon">📸</span>
                                <p>Click to add more photos</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    multiple 
                                    accept="image/*" 
                                    style={{ display: 'none' }}
                                />
                            </div>
                            
                            {previews.length > 0 && (
                                <div className="preview-grid" style={{ marginTop: 12 }}>
                                    {previews.map((src, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={src} alt="New Preview" />
                                            <button type="button" className="remove" onClick={() => removeNewImage(index)}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
