import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';

interface SubmitReviewModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ isVisible, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit(rating, comment);
            setRating(0);
            setComment('');
            onClose();
        } catch (error) {
            console.error('Submit review error:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Rate this Garage</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setRating(star)}
                                    >
                                        <Ionicons
                                            name={star <= rating ? 'star' : 'star-outline'}
                                            size={40}
                                            color={star <= rating ? Colors.warning : '#D1D5DB'}
                                            style={{ marginHorizontal: 4 }}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Your Feedback (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Tell us about your experience..."
                                multiline
                                numberOfLines={4}
                                value={comment}
                                onChangeText={setComment}
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && styles.disabledBtn]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Submit Review</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        fontSize: 14,
        color: '#1F2937',
        marginBottom: 24,
    },
    submitBtn: {
        backgroundColor: Colors.primary,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledBtn: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SubmitReviewModal;
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

