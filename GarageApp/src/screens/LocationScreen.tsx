import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView,
    PermissionsAndroid
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import Geolocation from 'react-native-geolocation-service';
import { WebView } from 'react-native-webview';
import { Colors, Typography, Spacing } from '../theme';
import { AUTH_URI, API } from '../api/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const INITIAL_COORDS = {
    latitude: 9.03,
    longitude: 38.74,
};

const LocationScreen = ({ navigation }: StackScreenProps<any>) => {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(true);
    const [markerCoordinate, setMarkerCoordinate] = useState(INITIAL_COORDS);
    const [garages, setGarages] = useState<any[]>([]);

    const webViewRef = useRef<WebView>(null);
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (watchId.current !== null) {
                Geolocation.clearWatch(watchId.current);
            }
        };
    }, []);

    const fetchNearbyGarages = async (lat: number, lng: number) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await API.get(`garages/nearby?lat=${lat}&lng=${lng}&radius=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setGarages(response.data.data);
                const garageJs = response.data.data.map((g: any) => `
                    L.marker([${g.latitude}, ${g.longitude}], {
                        icon: L.divIcon({
                            html: '<div style="background-color: #2C3E50; width: 30px; height: 30px; border-radius: 15px; border: 2px solid white; display: flex; justify-content: center; align-items: center; font-size: 14px;">🛠️</div>',
                            className: 'garage-marker',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30]
                        })
                    }).addTo(map).bindPopup("<b>${g.garageName}</b><br>${g.distance} km away");
                `).join('\n');
                webViewRef.current?.injectJavaScript(garageJs);
            }
        } catch (error) {
            console.error('Fetch garages error:', error);
        }
    };

    const startTracking = () => {
        if (watchId.current !== null) return;

        watchId.current = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMarkerCoordinate({ latitude, longitude });
                webViewRef.current?.injectJavaScript(`updateMarker(${latitude}, ${longitude});`);
            },
            (error) => console.log('Watch Error:', error),
            { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
        );
    };

    const handleUpdateLocation = async (locData: { address?: string, latitude?: number, longitude?: number }) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await AUTH_URI.put('profile/location', locData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                navigation.navigate('Home');
            } else {
                Alert.alert('Error', 'Failed to update location');
            }
        } catch (error: any) {
            console.error('Location update error:', error);
            Alert.alert('Error', 'Something went wrong while saving your location.');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = () => {
        // Use coordinates as address if no manual address is entered
        const finalAddress = address.trim() || `Location: ${markerCoordinate.latitude.toFixed(4)}, ${markerCoordinate.longitude.toFixed(4)}`;

        handleUpdateLocation({
            address: finalAddress,
            latitude: markerCoordinate.latitude,
            longitude: markerCoordinate.longitude
        });
    };

    const onMapMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'COORD_UPDATE') {
                setMarkerCoordinate({
                    latitude: data.latitude,
                    longitude: data.longitude
                });
                setAddress(`Pinned: ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
            }
        } catch (e) {
            console.error('WebView message error:', e);
        }
    };

    const zoomIn = () => {
        webViewRef.current?.injectJavaScript('map.zoomIn();');
    };

    const zoomOut = () => {
        webViewRef.current?.injectJavaScript('map.zoomOut();');
    };

    const detectLocation = async () => {
        setShowPermissionModal(false);
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'GarageApp needs access to your location to find nearby services.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied', 'Location permission is required to detect your position.');
                    return;
                }
            } catch (err) {
                console.warn(err);
                return;
            }
        }

        setDetecting(true);
        Geolocation.getCurrentPosition(
            (position) => {
                setDetecting(false);
                const { latitude, longitude } = position.coords;
                console.log('Detected position:', latitude, longitude);
                const newCoords = { latitude, longitude };

                setMarkerCoordinate(newCoords);
                setAddress(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

                // Update map view via JS injection
                const js = `
                    updateMarker(${latitude}, ${longitude});
                    map.setView([${latitude}, ${longitude}], 15);
                `;
                webViewRef.current?.injectJavaScript(js);

                fetchNearbyGarages(latitude, longitude);
                startTracking();
            },
            (error) => {
                setDetecting(false);
                console.error('Geolocation Error:', error);
                let msg = 'Unable to detect your location.';
                if (error.code === 1) msg = 'Location permission denied.';
                if (error.code === 2) msg = 'Location services are disabled on your device.';
                if (error.code === 3) msg = 'Location request timed out.';

                Alert.alert('Location Error', `${msg} Please check your settings or enter it manually.`);
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 10000,
                showLocationDialog: true,
                forceRequestLocation: true
            }
        );
    };

    const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Leaflet Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; background: #212121; }
            .leaflet-control-zoom { display: none; }
            .leaflet-attribution-control { font-size: 8px !important; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', {
                zoomControl: false,
                attributionControl: true
            }).setView([${markerCoordinate.latitude}, ${markerCoordinate.longitude}], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            var carIcon = L.divIcon({
                html: '<div style="background-color: ${Colors.primary}; width: 40px; height: 40px; border-radius: 20px; border: 3px solid white; display: flex; justify-content: center; align-items: center; box-shadow: 0 0 10px rgba(0,0,0,0.5); font-size: 20px;">🚗</div>',
                className: 'custom-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });

            var marker = L.marker([${markerCoordinate.latitude}, ${markerCoordinate.longitude}], {
                draggable: true,
                icon: carIcon
            }).addTo(map);

            marker.on('dragend', function(event) {
                var position = marker.getLatLng();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'COORD_UPDATE',
                    latitude: position.lat,
                    longitude: position.lng
                }));
            });

            function updateMarker(lat, lng) {
                marker.setLatLng([lat, lng]);
            }

            map.on('click', function(e) {
                marker.setLatLng(e.latlng);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'COORD_UPDATE',
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                }));
            });
        </script>
    </body>
    </html>
    `;

    return (
        <View style={styles.container}>
            <View style={StyleSheet.absoluteFill}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHtml }}
                    onMessage={onMapMessage}
                    style={{ flex: 1 }}
                    scrollEnabled={false}
                />
            </View>

            <View style={styles.overlayContainer} pointerEvents="box-none">
                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={zoomIn}>
                        <Text style={styles.controlText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={zoomOut}>
                        <Text style={styles.controlText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={detectLocation}>
                        <Text style={styles.controlText}>🧭</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSheet}>
                    <View style={styles.handleBar} />



                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleManualSubmit}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Confirm Location</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            {showPermissionModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.permissionCard}>
                        <View style={styles.permissionIconCircle}>
                            <View style={styles.innerCircle}>
                                <Text style={{ fontSize: 40 }}>📍</Text>
                            </View>
                        </View>
                        <Text style={styles.modalTitle}>What's your location?</Text>
                        <Text style={styles.modalSubtitle}>
                            We need your location to show available nearby Mechanic/Services.
                        </Text>

                        <TouchableOpacity
                            style={styles.allowBtn}
                            onPress={detectLocation}
                        >
                            <Text style={styles.allowBtnText}>Allow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.manualBtn}
                            onPress={() => setShowPermissionModal(false)}
                        >
                            <Text style={styles.manualBtnText}>Enter location manually</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => navigation.replace('Home')}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    topSearchContainer: {
        paddingTop: 60,
        paddingHorizontal: Spacing.l,
    },
    searchBar: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        height: 55,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        elevation: 8,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
    },
    mapControls: {
        position: 'absolute',
        right: Spacing.l,
        top: height * 0.25,
        gap: Spacing.md,
    },
    controlButton: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        width: 45,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    controlText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    bottomSheet: {
        backgroundColor: '#F3F4F9',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: Spacing.xl,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        minHeight: height * 0.1,
        elevation: 10,
    },
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#D1D5DB',
        alignSelf: 'center',
        borderRadius: 3,
        marginBottom: Spacing.xl,
    },
    currentLocationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: 'rgba(216, 95, 23, 0.05)',
        marginBottom: Spacing.xl,
    },
    iconCircle: {
        backgroundColor: 'rgba(216, 95, 23, 0.1)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    arrowIcon: {
        fontSize: 18,
        color: Colors.primary,
    },
    currentLocationTxt: {
        ...Typography.button,
        color: Colors.primary,
        fontSize: 16,
    },
    placesTitle: {
        ...Typography.h2,
        color: '#1F2937',
        fontSize: 18,
        marginBottom: Spacing.md,
    },
    placesList: {
        maxHeight: height * 0.15,
    },
    placeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    placeIcon: {
        fontSize: 20,
        marginRight: Spacing.md,
    },
    placeName: {
        fontWeight: '600',
        color: '#374151',
        fontSize: 14,
    },
    placeSub: {
        color: '#6B7280',
        fontSize: 11,
    },
    confirmBtn: {
        backgroundColor: Colors.primary,
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    confirmBtnText: {
        ...Typography.button,
        color: 'white',
        fontSize: 18,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    permissionCard: {
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        width: '100%',
        borderRadius: 30,
        padding: Spacing.xxl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    permissionIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    innerCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(216, 95, 23, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    modalTitle: {
        ...Typography.h1,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    modalSubtitle: {
        ...Typography.subtitle,
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: 40,
    },
    allowBtn: {
        backgroundColor: Colors.primary,
        width: '100%',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    allowBtnText: {
        ...Typography.button,
        fontSize: 18,
    },
    manualBtn: {
        width: '100%',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    manualBtnText: {
        ...Typography.button,
        fontSize: 16,
        color: Colors.primary,
    },
    cancelBtn: {
        marginTop: Spacing.md,
        padding: Spacing.sm,
    },
    cancelText: {
        ...Typography.small,
        color: '#9CA3AF',
        textDecorationLine: 'underline',
    },
});

export default LocationScreen;
