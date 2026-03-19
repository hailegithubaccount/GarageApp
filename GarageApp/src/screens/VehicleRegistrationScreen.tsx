import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { createVehicle$ } from '../api/vehicles/index';

import { launchImageLibrary } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

const VehicleRegistrationScreen = () => {
    const navigation = useNavigation<any>();
    const [model, setModel] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [brand, setBrand] = useState('');
    const [year, setYear] = useState('');
    const [color, setColor] = useState('');
    const [vehicleType, setVehicleType] = useState('Car');
    const [fuelType, setFuelType] = useState('Petrol');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fuelTypes = ['Petrol', 'Diesel', 'Electric'];
    const vehicleTypes = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus'];

    const selectImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) return;
            if (response.assets && response.assets.length > 0) {
                setImageUri(response.assets[0].uri || null);
            }
        });
    };

    const handleRegister = async () => {
        if (!model.trim() || !plateNumber.trim() || !brand.trim()) {
            Alert.alert('Error', 'Please fill in model, plate number and brand');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('model', String(model).trim());
            formData.append('plateNumber', String(plateNumber).trim());
            formData.append('brand', String(brand).trim());
            formData.append('year', String(year).trim());
            formData.append('color', String(color).trim());
            formData.append('vehicleType', String(vehicleType).trim());
            formData.append('fuelType', String(fuelType).trim());

            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'vehicle_image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type,
                } as any);
                console.log('Included image:', filename, type);
            }

            console.log('Starting registration request...');
            const result = await createVehicle$(formData);
            console.log('Registration success:', result);
            Alert.alert('Success', 'Vehicle registered successfully!');
            navigation.replace('Home');
        } catch (error: any) {
            console.error('Vehicle registration error:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Data:', error.response.data);
                console.error('Status:', error.response.status);
                Alert.alert('Error', `Server Error: ${error.response.data.message || 'Registration failed'}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Request:', error.request);
                Alert.alert('Error', 'Network Error: Please check your internet connection and server status.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error Message:', error.message);
                Alert.alert('Error', 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Register</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Add Your Vehicle</Text>

                {/* Vehicle Card */}
                <TouchableOpacity style={styles.vehicleCard} onPress={selectImage}>
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.selectedImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <>
                            <Image
                                source={require('../assets/images/login_bg.png')}
                                style={styles.carImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.carLabel}>Car</Text>
                            <Text style={styles.tapText}>Tap to add image</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Type</Text>
                        <View style={styles.fuelContainer}>
                            {vehicleTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.fuelOption,
                                        vehicleType === type && styles.fuelOptionActive
                                    ]}
                                    onPress={() => setVehicleType(type)}
                                >
                                    <Text style={[
                                        styles.fuelText,
                                        vehicleType === type && styles.fuelTextActive
                                    ]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Brand</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Toyota, BMW, etc."
                            placeholderTextColor="#9CA3AF"
                            value={brand}
                            onChangeText={setBrand}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Model</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your vehicle model"
                            placeholderTextColor="#9CA3AF"
                            value={model}
                            onChangeText={setModel}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your vehicle number"
                            placeholderTextColor="#9CA3AF"
                            value={plateNumber}
                            onChangeText={setPlateNumber}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={[styles.inputGroup, { width: '48%' }]}>
                            <Text style={styles.label}>Year</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 2022"
                                placeholderTextColor="#9CA3AF"
                                value={year}
                                onChangeText={setYear}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={[styles.inputGroup, { width: '48%' }]}>
                            <Text style={styles.label}>Color</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Red, Black"
                                placeholderTextColor="#9CA3AF"
                                value={color}
                                onChangeText={setColor}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Fuel Type</Text>
                        <View style={styles.fuelContainer}>
                            {fuelTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.fuelOption,
                                        fuelType === type && styles.fuelOptionActive
                                    ]}
                                    onPress={() => setFuelType(type)}
                                >
                                    <Text style={[
                                        styles.fuelText,
                                        fuelType === type && styles.fuelTextActive
                                    ]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.registerBtn}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.registerBtnText}>Complete</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: Colors.primary,
        height: height * 0.15,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 50,
        backgroundColor: 'white',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    backIcon: {
        fontSize: 20,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 20,
    },
    scrollContent: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginVertical: Spacing.l,
    },
    vehicleCard: {
        width: width * 0.7,
        aspectRatio: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 30,
        borderWidth: 3,
        borderColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        marginBottom: Spacing.xl,
    },
    carImage: {
        width: '80%',
        height: '60%',
    },
    carLabel: {
        fontSize: 28,
        fontWeight: '900',
        color: 'black',
        marginTop: 10,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 27,
    },
    tapText: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 5,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: Spacing.l,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        color: '#111827',
        elevation: 1,
    },
    fuelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 5,
    },
    fuelOption: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    fuelOptionActive: {
        backgroundColor: 'white',
        elevation: 2,
    },
    fuelText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    fuelTextActive: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    registerBtn: {
        backgroundColor: Colors.primary,
        width: '100%',
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: Spacing.xl,
        elevation: 5,
    },
    registerBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default VehicleRegistrationScreen;
