import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { Typography } from '../theme/Typography';
import { baseURL } from '../api/constants';

import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

interface WorkshopCardProps {
    item: any;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ item }) => {
    const navigation = useNavigation<any>();

    const handlePress = () => {
        navigation.navigate('GarageDetail', { garageId: item._id });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={handlePress}
        >
            <View style={styles.imageContainer}>
                {item.images && item.images.length > 0 ? (
                    <Image
                        source={{ uri: item.images[0].startsWith('http') ? item.images[0] : `${baseURL.replace('/api', '')}/uploads/garages/${item.images[0]}` }}
                        style={styles.image}
                    />
                ) : (
                    <View style={[styles.image, styles.placeholderContainer]}>
                        <Ionicons name="construct-outline" size={40} color="#E5E7EB" />
                    </View>
                )}

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={Colors.warning} />
                    <Text style={styles.ratingText}>
                        {item.averageRating && item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}
                    </Text>
                </View>

                {/* Favorite Button */}
                <TouchableOpacity style={styles.favoriteBtn}>
                    <Ionicons name="heart" size={20} color="#E74C3C" />
                </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>{item.garageName}</Text>
                    <View style={styles.distanceBadge}>
                        <Text style={styles.distanceText}>{item.distance !== undefined ? `${item.distance} Km` : '0.1 Km'}</Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {item.description || 'Specializing in car maintenance and professional auto services with certified mechanics.'}
                </Text>

                <View style={styles.footerRow}>
                    <View style={styles.statusContainer}>
                        <Ionicons name="time-outline" size={16} color={Colors.success} />
                        <Text style={styles.statusText}>{item.operatingHours || 'Open 24 hours'}</Text>
                    </View>

                    <View style={styles.availableBadge}>
                        <Text style={styles.availableText}>Available Today</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginRight: Spacing.md,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        marginBottom: 10,
    },
    imageContainer: {
        width: '100%',
        height: 150,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContainer: {
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginLeft: 4,
    },
    favoriteBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        marginRight: 8,
    },
    distanceBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    distanceText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 16,
        height: 36,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        color: Colors.success,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    availableBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    availableText: {
        fontSize: 11,
        color: '#10B981',
        fontWeight: 'bold',
    },
});

export default WorkshopCard;
