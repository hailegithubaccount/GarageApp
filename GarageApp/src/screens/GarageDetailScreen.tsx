import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    FlatList,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackScreenProps } from '@react-navigation/stack';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { Typography } from '../theme/Typography';
import { API, baseURL } from '../api/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getVehicles$ } from '../api/vehicles/index';
import { Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

const GarageDetailScreen = ({ route, navigation }: StackScreenProps<any>) => {
    const garageId = route.params?.garageId;
    const [garage, setGarage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pricing'); // Default as per image
    const [selectedService, setSelectedService] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        fetchGarageDetails();
        fetchUserVehicles();
    }, [garageId]);

    const fetchUserVehicles = async () => {
        try {
            const response = await getVehicles$();
            if (response.data.success) {
                setVehicles(response.data.data);
            }
        } catch (error) {
            console.error('Fetch vehicles error:', error);
        }
    };

    const fetchGarageDetails = async () => {
        try {
            const response = await API.get(`garages/${garageId}`);

            if (response.data.success) {
                setGarage(response.data.data);
            }
        } catch (error) {
            console.error('Fetch garage details error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = async () => {
        if (!selectedService) {
            Alert.alert('Selection Required', 'Please select a service from the Pricing table first.');
            return;
        }

        if (vehicles.length === 0) {
            Alert.alert(
                'No Vehicle Found',
                'You need to register a vehicle before booking a service.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Register Now', onPress: () => navigation.navigate('VehicleRegistration') }
                ]
            );
            return;
        }

        // Navigate to MyVehicles for explicit selection
        navigation.navigate('MyVehicles', {
            garageId,
            serviceDetails: {
                _id: selectedService._id,
                name: selectedService.serviceName || selectedService.name,
                price: selectedService.price,
                description: selectedService.description || selectedService.notes || `Booking for ${selectedService.serviceName || selectedService.name}`
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!garage) {
        return (
            <View style={styles.errorContainer}>
                <Text>Garage not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Prepare image for header
    const headerImage = garage.images && garage.images.length > 0
        ? { uri: garage.images[0].startsWith('http') ? garage.images[0] : `${baseURL.replace('/api', '')}/uploads/garages/${garage.images[0]}` }
        : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Image Section */}
                <View style={styles.headerContainer}>
                    {headerImage ? (
                        <Image source={headerImage} style={styles.mainImage} />
                    ) : (
                        <View style={[styles.mainImage, styles.placeholderImage]}>
                            <Ionicons name="construct-outline" size={80} color="#E5E7EB" />
                        </View>
                    )}

                    {/* Header Overlays */}
                    <View style={styles.headerTopButtons}>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                        </TouchableOpacity>

                        <View style={styles.rightButtons}>
                            <TouchableOpacity style={[styles.circleBtn, { marginRight: Spacing.md }]}>
                                <Ionicons name="share-social" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.circleBtn}>
                                <Ionicons name="heart" size={24} color="#E74C3C" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Image Pagination Indicator */}
                    <View style={styles.imagePagination}>
                        <Ionicons name="images-outline" size={14} color="white" />
                        <Text style={styles.paginationText}>1/3</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.promoText}>Book our service now</Text>
                        <View style={styles.ratingRow}>
                            <View style={styles.stars}>
                                <Ionicons name="star" size={18} color="#F1C40F" />
                                <Ionicons name="star" size={18} color="#F1C40F" />
                                <Ionicons name="star" size={18} color="#F1C40F" />
                                <Ionicons name="star" size={18} color="#F1C40F" />
                                <Ionicons name="star-outline" size={18} color="#F1C40F" />
                            </View>
                            <Text style={styles.ratingCount}>4.6(655)</Text>
                        </View>
                    </View>

                    <Text style={styles.garageName}>{garage.garageName}</Text>

                    <Text style={styles.subCategory}>Car repair and Maintainance</Text>
                    <Text style={styles.descriptionText}>
                        {garage.description || 'Includes oil change, Brake check and General inspection.'}
                    </Text>

                    <View style={styles.statusRow}>
                        <Ionicons name="time-outline" size={18} color={Colors.success} />
                        <Text style={styles.statusText}>{garage.operatingHours || 'Open 24 hours'}</Text>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'About' && styles.activeTabButton]}
                            onPress={() => setActiveTab('About')}
                        >
                            <Ionicons name="person-outline" size={18} color={activeTab === 'About' ? Colors.primary : '#6B7280'} />
                            <Text style={[styles.tabText, activeTab === 'About' && styles.activeTabText]}>About</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Direction' && styles.activeTabButton]}
                            onPress={() => setActiveTab('Direction')}
                        >
                            <Ionicons name="location-outline" size={18} color={activeTab === 'Direction' ? Colors.primary : '#6B7280'} />
                            <Text style={[styles.tabText, activeTab === 'Direction' && styles.activeTabText]}>Direction</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Pricing' && styles.activeTabButton]}
                            onPress={() => setActiveTab('Pricing')}
                        >
                            <Ionicons name="pricetag-outline" size={18} color={activeTab === 'Pricing' ? Colors.primary : '#6B7280'} />
                            <Text style={[styles.tabText, activeTab === 'Pricing' && styles.activeTabText]}>Pricing</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Pricing Table (Mocked if empty) */}
                    {activeTab === 'Pricing' && (
                        <View style={styles.tableContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Service</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Estimated Price($)</Text>
                                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Notes</Text>
                            </View>

                            {(garage.services && garage.services.length > 0 ? garage.services : [
                                { name: 'Engine Oil Change', price: '₹100 - ₹450', notes: 'Includes oil + filter replacement' },
                                { name: 'Brake pad replacement', price: '₹400 - ₹550', notes: 'Includes labour & parts' },
                                { name: 'Full car service', price: '₹900 - ₹1000', notes: 'Depends on car model and condition' },
                                { name: 'Battery replacement', price: '₹150 - ₹300', notes: 'Based on battery type' },
                            ]).map((service: any, index: number) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.tableRow,
                                        selectedService?._id === service._id && styles.selectedTableRow
                                    ]}
                                    onPress={() => setSelectedService(service)}
                                >
                                    <View style={{ flex: 1.5 }}>
                                        <Text style={styles.serviceName}>{service.serviceName || service.name}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.servicePrice}>{service.price || '₹100'}</Text>
                                    </View>
                                    <View style={{ flex: 1.5 }}>
                                        <Text style={styles.serviceNotes} numberOfLines={2}>{service.description || service.notes || '-'}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Reviews Section */}
                    <View style={styles.reviewsSection}>
                        <Text style={styles.sectionTitle}>Verified Reviews <Text style={{ color: '#6B7280', fontWeight: 'normal' }}>(655)</Text></Text>

                        <View style={styles.ratingSummaryCard}>
                            <Text style={styles.summaryValue}>4.6</Text>
                            <View style={styles.summaryStars}>
                                <View style={styles.stars}>
                                    <Ionicons name="star" size={18} color="#F1C40F" />
                                    <Ionicons name="star" size={18} color="#F1C40F" />
                                    <Ionicons name="star" size={18} color="#F1C40F" />
                                    <Ionicons name="star" size={18} color="#F1C40F" />
                                    <Ionicons name="star-half" size={18} color="#F1C40F" />
                                </View>
                                <Text style={styles.summarySubtitle}>Based on 655 Reviews</Text>
                            </View>
                        </View>

                        {/* Recent Review Item */}
                        <View style={styles.reviewItem}>
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/150?u=abdul' }}
                                style={styles.reviewerAvatar}
                            />
                            <View style={styles.reviewContent}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>Abdul kareem</Text>
                                    <View style={styles.itemRating}>
                                        <Ionicons name="star" size={14} color="#F1C40F" />
                                        <Text style={styles.itemRatingText}>4.2</Text>
                                    </View>
                                </View>
                                <Text style={styles.reviewDate}>Nov 18, 2024</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Booking Bar */}
            <View style={styles.footer}>
                <View style={styles.priceInfo}>
                    {selectedService ? (
                        <>
                            <Text style={styles.priceFromLabel} numberOfLines={1}>{selectedService.serviceName || selectedService.name}</Text>
                            <View style={styles.currentPriceRow}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <Text style={styles.mainPrice}>{selectedService.price?.toString().split(' - ')[0].replace('₹', '') || '100'}</Text>
                                <Text style={styles.bookingAmountLabel}>Selected</Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.priceFromLabel}>From <Text style={{ textDecorationLine: 'line-through' }}>₹100</Text></Text>
                            <View style={styles.currentPriceRow}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <Text style={styles.mainPrice}>75</Text>
                                <Text style={styles.bookingAmountLabel}>Booking amount</Text>
                            </View>
                        </>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.bookBtn, bookingLoading && { opacity: 0.7 }]}
                    onPress={handleBookNow}
                    disabled={bookingLoading}
                >
                    {bookingLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.bookBtnText}>Book Now !</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F9',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backLink: {
        color: Colors.primary,
        marginTop: 10,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    headerContainer: {
        width: '100%',
        height: height * 0.4,
        position: 'relative',
    },
    mainImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTopButtons: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rightButtons: {
        flexDirection: 'row',
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    imagePagination: {
        position: 'absolute',
        bottom: 20,
        left: width / 2 - 30,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    paginationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 5,
    },
    contentCard: {
        backgroundColor: '#F3F4F9',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        padding: Spacing.xl,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    promoText: {
        color: '#2C3E50',
        fontWeight: '600',
        fontSize: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stars: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingCount: {
        color: '#1A1A1A',
        fontSize: 14,
        fontWeight: 'bold',
    },
    garageName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subCategory: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusText: {
        fontSize: 14,
        color: Colors.success,
        fontWeight: '600',
        marginLeft: 6,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: 'white',
        borderRadius: 20,
        marginHorizontal: 4,
        elevation: 2,
    },
    activeTabButton: {
        backgroundColor: 'rgba(216, 95, 23, 0.05)',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: Colors.primary,
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        elevation: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 10,
        marginBottom: 10,
    },
    tableHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    selectedTableRow: {
        backgroundColor: 'rgba(216, 95, 23, 0.1)',
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    serviceName: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '600',
    },
    servicePrice: {
        fontSize: 13,
        color: '#374151',
        fontWeight: 'bold',
    },
    serviceNotes: {
        fontSize: 12,
        color: '#6B7280',
    },
    reviewsSection: {
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
    },
    ratingSummaryCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 1,
    },
    summaryValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1F2937',
        marginRight: 20,
    },
    summaryStars: {
        flex: 1,
    },
    summarySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    reviewItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
    },
    reviewerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    reviewContent: {
        flex: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    itemRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemRatingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginLeft: 4,
    },
    reviewDate: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    priceInfo: {
        flex: 1,
    },
    priceFromLabel: {
        fontSize: 16,
        color: '#4B5563',
        marginBottom: 2,
    },
    currentPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    mainPrice: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.primary,
        marginHorizontal: 4,
    },
    bookingAmountLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    bookBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 14,
    },
    bookBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default GarageDetailScreen;
