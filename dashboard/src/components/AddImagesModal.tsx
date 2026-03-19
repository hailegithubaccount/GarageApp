'use client';

import { useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';

interface AddImagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    garageId: string;
    garageName: string;
    onSuccess: () => void;
}

export default function AddImagesModal({ isOpen, onClose, garageId, garageName, onSuccess }: AddImagesModalProps) {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

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
        if (images.length === 0) {
            setError('Please select at least one image');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            images.forEach(image => {
                data.append('garageImages', image);
            });

            await apiFetch(`/garages/${garageId}/upload-images`, {
                method: 'POST',
                body: data
            });

            onSuccess();
            onClose();
            setImages([]);
            setPreviews([]);
        } catch (err: any) {
            setError(err.message || 'Failed to upload images');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Add Photos to {garageName}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
                        
                        <div className="form-group">
                            <label>Garage Images</label>
                            <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <span className="icon">📸</span>
                                <p>Click to select photos (Max 5 at once)</p>
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
                            {loading ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Upload Photos'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
