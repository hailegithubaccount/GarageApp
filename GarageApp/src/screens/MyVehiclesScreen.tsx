import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Image,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { getVehicles$ } from '../api/vehicles/index';
import { createServiceRequest$ } from '../api/serviceRequests/index';
import { baseURL } from '../api/constants';
import { Alert } from 'react-native';

const { width, height } = Dimensions.get('window');

const MyVehiclesScreen = ({ route }: any) => {
    const navigation = useNavigation<any>();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const garageId = route.params?.garageId;
    const serviceDetails = route.params?.serviceDetails;

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const response = await getVehicles$();
            if (response.data.success) {
                setVehicles(response.data.data);
            }
        } catch (error) {
            console.error('Fetch vehicles error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleSelect = (vehicle: any) => {
        if (garageId && serviceDetails) {
            confirmBooking(vehicle);
        } else {
            // Future: View vehicle details
            console.log('Vehicle selected:', vehicle._id);
        }
    };

    const confirmBooking = (vehicle: any) => {
        Alert.alert(
            'Confirm Booking',
            `Do you want to book ${serviceDetails.name} for your ${vehicle.model}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => processBooking(vehicle._id)
                }
            ]
        );
    };

    const processBooking = async (vehicleId: string) => {
        setBookingLoading(true);
        try {
            const response = await createServiceRequest$({
                vehicleId,
                garageId,
                serviceId: serviceDetails._id,
                serviceType: serviceDetails.name,
                description: serviceDetails.description,
                preferredDate: new Date().toISOString().split('T')[0],
                preferredTime: '10:00 AM',
                isEmergency: false,
            });

            if (response.data.success) {
                Alert.alert(
                    'Booking Successful!',
                    'Your service request has been submitted successfully.',
                    [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
                );
            }
        } catch (error: any) {
            console.error('Booking error:', error);
            Alert.alert('Booking Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    const otherVehicles = [
        { id: 'car', name: 'Car', icon: 'car' },
        { id: 'bike', name: 'Bike', icon: 'bicycle' },
        { id: 'scooter', name: 'Scooter', icon: 'motorcycle' },
        { id: 'bus', name: 'Bus', icon: 'bus' },
        { id: 'truck', name: 'Truck', icon: 'truck' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.mainTitle}>Select vehicle to book a service</Text>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Registered Vehicles</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
                ) : (
                    <>
                        {bookingLoading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                                <Text style={styles.loadingText}>Processing Booking...</Text>
                            </View>
                        )}
                        {vehicles.map((vehicle) => (
                            <TouchableOpacity
                                key={vehicle._id}
                                style={styles.vehicleCard}
                                onPress={() => handleVehicleSelect(vehicle)}
                            >
                                <View style={styles.vehicleIconContainer}>
                                    {vehicle.image ? (
                                        <Image
                                            source={{ uri: `${baseURL.replace('/api', '')}/${vehicle.image}` }}
                                            style={styles.vehicleImage}
                                        />
                                    ) : (
                                        <Ionicons name="car" size={30} color="#6B7280" />
                                    )}
                                </View>
                                <View style={styles.vehicleInfo}>
                                    <Text style={styles.vehicleModel}>{vehicle.model || 'Unknown Model'}</Text>
                                    <Text style={styles.vehiclePlate}>{vehicle.plateNumber}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.addVehicleCard}
                            onPress={() => navigation.navigate('VehicleRegistration')}
                        >
                            <View style={styles.addIconContainer}>
                                <Ionicons name="add" size={30} color="#6B7280" />
                            </View>
                            <View style={styles.vehicleInfo}>
                                <Text style={styles.addVehicleText}>Add New Vehicle</Text>
                                <Text style={styles.addVehicleSubtext}>Register a new vehicle to your account</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                )}

                <View style={[styles.sectionHeader, { marginTop: 25 }]}>
                    <Text style={styles.sectionTitle}>Other Vehicle</Text>
                    <Text style={styles.sectionSubtitle}>Don't want to register? Use quick booking</Text>
                </View>

                <View style={styles.grid}>
                    {otherVehicles.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.gridItem}>
                            <View style={styles.gridIconContainer}>
                                <Ionicons name={item.icon as any} size={40} color={Colors.primary} />
                            </View>
                            <Text style={styles.gridText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: Colors.primary,
        height: height * 0.18,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 60,
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addVehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    vehicleIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden',
    },
    vehicleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    addIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleModel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    vehiclePlate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    addVehicleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    addVehicleSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    gridItem: {
        width: (width - 60) / 3,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    gridIconContainer: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    gridText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.primary,
        fontWeight: 'bold',
    },
});

export default MyVehiclesScreen;
