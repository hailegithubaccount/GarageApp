import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
    FlatList,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { Typography } from '../theme/Typography';
import { API } from '../api/constants';
import WorkshopCard from '../components/WorkshopCard';

const { width, height } = Dimensions.get('window');

const ExploreScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState({ latitude: 9.03, longitude: 38.74 });
    const [garages, setGarages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeGarageIndex, setActiveGarageIndex] = useState(0);

    const webViewRef = useRef<WebView>(null);
    const flatListRef = useRef<FlatList>(null);
    const watchId = useRef<number | null>(null);

    useEffect(() => {
        requestLocationPermission();
        return () => {
            if (watchId.current !== null) {
                Geolocation.clearWatch(watchId.current);
            }
        };
    }, []);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                startTracking();
                getCurrentLocation();
            }
        } else {
            Geolocation.requestAuthorization('whenInUse');
            startTracking();
            getCurrentLocation();
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                fetchNearbyGarages(latitude, longitude);
                updateMapCenter(latitude, longitude);
            },
            (error) => console.log('Location Error:', error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const startTracking = () => {
        watchId.current = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                webViewRef.current?.injectJavaScript(`updateUserMarker(${latitude}, ${longitude});`);
            },
            (error) => console.log('Watch Error:', error),
            { enableHighAccuracy: true, distanceFilter: 10 }
        );
    };

    const fetchNearbyGarages = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await API.get(`garages/nearby?lat=${lat}&lng=${lng}&radius=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setGarages(response.data.data);
                updateMapMarkers(response.data.data);
            }
        } catch (error) {
            console.error('Fetch garages error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateMapCenter = (lat: number, lng: number) => {
        webViewRef.current?.injectJavaScript(`
            map.setView([${lat}, ${lng}], 15);
            updateDistanceLine(${userLocation.latitude}, ${userLocation.longitude}, ${lat}, ${lng});
        `);
    };

    const updateMapMarkers = (garageList: any[]) => {
        const markersJs = garageList.map((g, index) => `
            L.marker([${g.latitude}, ${g.longitude}], {
                icon: L.divIcon({
                    html: '<div style="background-color: ${Colors.primary}; width: 28px; height: 28px; border-radius: 14px 14px 14px 0; transform: rotate(-45deg); border: 2.5px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;"><div style="transform: rotate(45deg); font-size: 14px;">📍</div></div>',
                    className: 'garage-marker',
                    iconSize: [28, 28],
                    iconAnchor: [14, 28]
                })
            }).addTo(markersGroup).on('click', () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_CLICK', index: ${index} }));
                map.setView([${g.latitude}, ${g.longitude}], 15);
                updateDistanceLine(${userLocation.latitude}, ${userLocation.longitude}, ${g.latitude}, ${g.longitude});
            });
        `).join('\n');

        webViewRef.current?.injectJavaScript(`
            markersGroup.clearLayers();
            ${markersJs}
        `);
    };

    const onMessage = (event: any) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'MARKER_CLICK') {
            flatListRef.current?.scrollToIndex({ index: data.index, animated: true });
            setActiveGarageIndex(data.index);
        }
    };

    const handleCarouselScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.85));
        if (index !== activeGarageIndex && index >= 0 && index < garages.length) {
            setActiveGarageIndex(index);
            const garage = garages[index];
            updateMapCenter(garage.latitude, garage.longitude);
        }
    };

    const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; background: #212121; }
            .leaflet-bar { border: none !important; }
            .leaflet-control-attribution { display: none; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var map = L.map('map', { zoomControl: false }).setView([${userLocation.latitude}, ${userLocation.longitude}], 14);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(map);

            var markersGroup = L.layerGroup().addTo(map);
            var distanceLine = L.polyline([], { color: '${Colors.primary}', weight: 3, dashArray: '10, 10', opacity: 0.8 }).addTo(map);

            var userIcon = L.divIcon({
                html: '<div style="background-color: #3B82F6; width: 14px; height: 14px; border-radius: 7px; border: 2px solid white; box-shadow: 0 0 10px #3B82F6;"></div>',
                className: 'user-marker',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });
            var userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon }).addTo(map);

            function updateUserMarker(lat, lng) {
                userMarker.setLatLng([lat, lng]);
            }

            function updateDistanceLine(uLat, uLng, gLat, gLng) {
                distanceLine.setLatLngs([[uLat, uLng], [gLat, gLng]]);
                map.fitBounds(distanceLine.getBounds(), { padding: [50, 50] });
            }
        </script>
    </body>
    </html>
    `;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Map Background */}
            <View style={StyleSheet.absoluteFill}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: leafletHtml }}
                    onMessage={onMessage}
                    style={{ flex: 1 }}
                />
            </View>

            {/* Overlay UI */}
            <View style={styles.overlay} pointerEvents="box-none">
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for workshop nearby"
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity style={styles.filterBtn}>
                            <Ionicons name="options-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Map Controls */}
                <View style={styles.mapControls}>
                    <TouchableOpacity style={styles.controlBtn} onPress={() => webViewRef.current?.injectJavaScript('map.zoomIn()')}>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn} onPress={() => webViewRef.current?.injectJavaScript('map.zoomOut()')}>
                        <Ionicons name="remove" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn} onPress={getCurrentLocation}>
                        <Ionicons name="navigate" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Garage Carousel */}
                <View style={styles.carouselContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={garages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item._id}
                            snapToInterval={width * 0.85}
                            decelerationRate="fast"
                            contentContainerStyle={{ paddingHorizontal: Spacing.xl }}
                            onMomentumScrollEnd={handleCarouselScroll}
                            renderItem={({ item }) => (
                                <WorkshopCard item={item} />
                            )}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingBottom: 90, // Room for bottom navigator
    },
    searchContainer: {
        paddingTop: Platform.OS === 'ios' ? 20 : 50,
        paddingHorizontal: Spacing.xl,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        borderRadius: 16,
        paddingHorizontal: Spacing.md,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
        fontSize: 16,
    },
    filterBtn: {
        backgroundColor: Colors.primary,
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapControls: {
        position: 'absolute',
        right: Spacing.xl,
        top: height * 0.25,
        gap: Spacing.md,
    },
    controlBtn: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    carouselContainer: {
        paddingBottom: Spacing.xl,
    }
});

export default ExploreScreen;
