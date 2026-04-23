'use client';

import { useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';

interface RegisterGarageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterGarageModal({ isOpen, onClose, onSuccess }: RegisterGarageModalProps) {
    const [formData, setFormData] = useState({
        garageName: '',
        location: '',
        contactNumber: '',
        description: '',
        operatingHours: '',
        latitude: '',
        longitude: ''
    });
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);
            
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) data.append(key, value);
            });
            
            images.forEach(image => {
                data.append('garageImages', image);
            });

            await apiFetch('/garages', {
                method: 'POST',
                body: data
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to register garage');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Register Your Garage</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
                        
                        <div className="form-group">
                            <label>Garage Name</label>
                            <input 
                                type="text" 
                                name="garageName" 
                                className="input" 
                                value={formData.garageName} 
                                onChange={handleChange} 
                                required 
                                placeholder="Enter garage name"
                            />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Location Address</label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    className="input" 
                                    value={formData.location} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="City, Area"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <input 
                                    type="text" 
                                    name="contactNumber" 
                                    className="input" 
                                    value={formData.contactNumber} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="+251..."
                                />
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Operating Hours</label>
                                <input 
                                    type="text" 
                                    name="operatingHours" 
                                    className="input" 
                                    value={formData.operatingHours} 
                                    onChange={handleChange} 
                                    placeholder="e.g. 8:00 AM - 6:00 PM"
                                />
                            </div>
                            <div className="form-group">
                                <label>Coordinates (Optional)</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input 
                                        type="number" 
                                        name="latitude" 
                                        className="input" 
                                        value={formData.latitude} 
                                        onChange={handleChange} 
                                        placeholder="Lat" 
                                        step="any"
                                    />
                                    <input 
                                        type="number" 
                                        name="longitude" 
                                        className="input" 
                                        value={formData.longitude} 
                                        onChange={handleChange} 
                                        placeholder="Lng" 
                                        step="any"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                placeholder="Tell us about your services..."
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Garage Images</label>
                            <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <span className="icon">📸</span>
                                <p>Click to upload garage photos (Max 5)</p>
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
                                <div className="preview-grid">
                                    {previews.map((src, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={src} alt="Preview" />
                                            <button type="button" className="remove" onClick={() => removeImage(index)}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Register Garage'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
