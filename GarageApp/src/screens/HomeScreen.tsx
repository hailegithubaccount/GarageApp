import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { useUserStore } from '../store/userStore';
import { getNotifications$ } from '../api/notifications';

const { width } = Dimensions.get('window');

const FEATURED_SERVICES = [
    { id: '1', name: 'Emergency', icon: '🚨', type: 'sos' },
    { id: '2', name: 'Mechanic', icon: '🧑‍🔧', type: 'quick' },
    { id: '3', name: 'Tyre repair', icon: '🛞', type: 'quick' },
    { id: '4', name: 'Tow truck', icon: '🛻', type: 'quick' },
];

const EXPLORE_SERVICES = [
    { id: '5', name: 'Fuel ststion', icon: '⛽', type: 'explore' },
    { id: '6', name: 'EV station', icon: '🔌', type: 'explore' },
    { id: '7', name: 'Water service', icon: '🧼', type: 'explore' },
    { id: '8', name: 'Accessories', icon: '⚙️', type: 'explore' },
];

const HomeScreen = ({ navigation }: any) => {
    const { user, fetchProfile, loading } = useUserStore();
    const [unreadCount, setUnreadCount] = React.useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications$();
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications on home:', error);
        }
    };

    React.useEffect(() => {
        fetchProfile();
        fetchNotifications();

        // Refresh count every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const displayName = user?.fullName || 'Valued User';
    const displayLocation = user?.location?.address || 'Detecting location...';

    return (
        <SafeAreaView style={styles.container}>

            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} animated />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: user?.profileImage || `https://ui-avatars.com/api/?name=${displayName}&background=random` }}
                                    style={styles.avatar}
                                />
                            </View>
                            <View style={styles.profileText}>
                                <Text style={styles.welcomeTxt}>Hai, {displayName}!</Text>
                                <TouchableOpacity style={styles.locationSelector}>
                                    <Text style={styles.locationTxt} numberOfLines={1}>📍 {displayLocation}</Text>
                                    <Text style={styles.dropdownIcon}>⌄</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.notificationBtn}
                            onPress={() => navigation.navigate('Notifications')}
                        >
                            <Text style={styles.bellIcon}>🔔</Text>
                            {unreadCount > 0 && <View style={styles.notifDot} />}
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchSection}>
                        <View style={styles.searchBar}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                placeholder="Search for workshops nearby"
                                placeholderTextColor="#9CA3AF"
                                style={styles.searchInput}
                            />
                            <TouchableOpacity style={styles.filterBtn}>
                                <Text style={styles.filterIcon}>⚙️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.mainBody}>
                    {/* Special Offers Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Special Offers</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                    </View>

                    <View style={styles.offerCard}>
                        <View style={styles.offerTextContent}>
                            <Text style={styles.offerTag}>Engine Diagonastic</Text>
                            <Text style={styles.offerHeadline}>Get Special Offer</Text>
                            <Text style={styles.offerSubline}>Up to <Text style={styles.offerPercent}>40%</Text></Text>
                            <TouchableOpacity style={styles.bookNowBtn}>
                                <Text style={styles.bookNowText}>Book Now</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.offerImageContainer}>
                            <Image
                                source={require('../assets/images/splash_bg.png')}
                                style={styles.offerImage}
                                resizeMode="cover"
                            />
                        </View>
                    </View>

                    {/* Dots indicator */}
                    <View style={styles.dotsContainer}>
                        <View style={styles.dotInactive} />
                        <View style={styles.dotActive} />
                        <View style={styles.dotInactive} />
                    </View>

                    {/* Quick ServicesSection */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Quick Services</Text>
                    </View>

                    <View style={styles.gridContainer}>
                        {FEATURED_SERVICES.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.serviceItem}>
                                <View style={[styles.iconCircle, item.type === 'sos' && styles.sosGradient]}>
                                    <Text style={styles.serviceIcon}>{item.icon}</Text>
                                    {item.type === 'sos' && <Text style={styles.sosText}>SOS</Text>}
                                </View>
                                <Text style={styles.serviceLabel}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Explore Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Explore</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                    </View>

                    <View style={styles.gridContainer}>
                        {EXPLORE_SERVICES.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.serviceItem}>
                                <View style={styles.iconCircleExplore}>
                                    <Text style={styles.serviceIconExplore}>{item.icon}</Text>
                                </View>
                                <Text style={styles.serviceLabel}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Padding for Bottom Tab */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,

    },
    header: {
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingBottom: 30,
        paddingHorizontal: Spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 25,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'white',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileText: {
        marginLeft: 12,
    },
    welcomeTxt: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationTxt: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    dropdownIcon: {
        color: 'white',
        fontSize: 12,
        marginLeft: 4,
    },
    notificationBtn: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    bellIcon: {
        fontSize: 20,
    },
    notifDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF9800',
        borderWidth: 1,
        borderColor: 'white',
    },
    searchSection: {
        marginTop: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        elevation: 5,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    filterBtn: {
        backgroundColor: Colors.primary,
        padding: 8,
        borderRadius: 10,
    },
    filterIcon: {
        color: 'white',
        fontSize: 16,
    },
    mainBody: {
        paddingHorizontal: Spacing.xl,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    seeAll: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    offerCard: {
        backgroundColor: '#2D3436',
        borderRadius: 30,
        flexDirection: 'row',
        height: 180,
        overflow: 'hidden',
        elevation: 8,
    },
    offerTextContent: {
        flex: 1.2,
        padding: 20,
        justifyContent: 'center',
    },
    offerTag: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 5,
    },
    offerHeadline: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    offerSubline: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        marginTop: 2,
    },
    offerPercent: {
        fontSize: 32,
        color: '#FF9800',
    },
    bookNowBtn: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginTop: 15,
        alignSelf: 'flex-start',
    },
    bookNowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    offerImageContainer: {
        flex: 1,
        borderTopLeftRadius: 100,
        borderBottomLeftRadius: 100,
        overflow: 'hidden',
    },
    offerImage: {
        width: '100%',
        height: '100%',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
        gap: 6,
    },
    dotActive: {
        width: 12,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
    },
    dotInactive: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D1D5DB',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    serviceItem: {
        width: (width - 60) / 4,
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        marginBottom: 8,
    },
    iconCircleExplore: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 8,
    },
    sosGradient: {
        backgroundColor: 'white', // Placeholder for actual gradient
    },
    serviceIcon: {
        fontSize: 28,
    },
    serviceIconExplore: {
        fontSize: 24,
    },
    sosText: {
        fontSize: 10,
        color: 'red',
        fontWeight: 'bold',
        marginTop: -5,
    },
    serviceLabel: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default HomeScreen;
