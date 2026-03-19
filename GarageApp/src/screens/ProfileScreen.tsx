import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { useUserStore } from '../store/userStore';
import { AUTH_URI } from '../api/constants';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user, fetchProfile } = useUserStore();
    const [uploading, setUploading] = React.useState(false);

    const menuItems = [
        { id: '1', title: 'My Account', icon: 'person', color: '#D35400' },
        { id: '2', title: 'Workshop Activity', icon: 'clipboard', color: '#D35400' },
        { id: '3', title: 'My Vehicles', icon: 'car', color: '#D35400', route: 'MyVehicles' },
        { id: '4', title: 'General Settings', icon: 'settings', color: '#D35400' },
        { id: '5', title: 'Support', icon: 'help-circle', color: '#D35400' },
        { id: '6', title: 'Log Out', icon: 'log-out', color: '#E74C3C', isLogout: true },
    ];

    const handleMenuPress = (item: any) => {
        if (item.route) {
            navigation.navigate(item.route);
        } else if (item.isLogout) {
            // Implementation for logout would go here
        }
    };

    const handleImagePick = async () => {
        const options: any = {
            mediaType: 'photo',
            quality: 0.7,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];
                await uploadImage(asset);
            }
        });
    };

    const uploadImage = async (asset: any) => {
        setUploading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const formData = new FormData();
            formData.append('profileImage', {
                uri: asset.uri,
                type: asset.type,
                name: asset.fileName || 'profile.jpg',
            } as any);

            const response = await AUTH_URI.post('upload-profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                await fetchProfile(); // Refresh user data to get new image URL
            }
        } catch (error) {
            console.error('Upload Error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header Background */}
                <View style={styles.headerBackground}>
                    <View style={styles.profileInfo}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={handleImagePick}
                            disabled={uploading}
                        >
                            <Image
                                source={{ uri: user?.profileImage || 'https://i.pravatar.cc/150?u=rahul' }}
                                style={styles.avatar}
                            />
                            {uploading ? (
                                <View style={styles.uploadOverlay}>
                                    <ActivityIndicator color="white" />
                                </View>
                            ) : (
                                <View style={styles.uploadOverlay}>
                                    <Ionicons name="camera" size={20} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.userName}>{user?.fullName || 'Rahul K Nair'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'rahulknair@gmail.com'}</Text>
                        <TouchableOpacity style={styles.editProfileBtn}>
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Invite Card */}
                <View style={styles.inviteCard}>
                    <View style={styles.inviteContent}>
                        <Text style={styles.inviteTitle}>Invite Friends</Text>
                        <Text style={styles.inviteDesc}>
                            Invite your friends to your Mechano world and get <Text style={styles.perkText}>₹100</Text> each.
                        </Text>
                    </View>
                    <View style={styles.inviteIconContainer}>
                        <Ionicons name="people" size={40} color="white" style={{ opacity: 0.8 }} />
                        <Text style={[styles.perkText, { position: 'absolute', top: 5, left: -15, fontSize: 24 }]}>+</Text>
                    </View>
                </View>

                {/* Menu List */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={styles.menuIconContainer}>
                                <Ionicons name={item.icon} size={20} color={item.color} />
                            </View>
                            <Text style={[styles.menuTitle, item.isLogout && { color: '#E74C3C' }]}>
                                {item.title}
                            </Text>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F3F4F9',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    headerBackground: {
        height: 300,
        backgroundColor: '#D35400',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    profileInfo: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'white',
        padding: 2,
        backgroundColor: 'white',
        marginBottom: 15,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 48,
    },
    uploadOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 20,
    },
    editProfileBtn: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 25,
        paddingVertical: 8,
        borderRadius: 10,
    },
    editProfileText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    inviteCard: {
        marginHorizontal: Spacing.xl,
        marginTop: -50,
        backgroundColor: '#D35400',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 8,
        shadowColor: '#D35400',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    inviteContent: {
        flex: 1,
    },
    inviteTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    inviteDesc: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 18,
    },
    perkText: {
        fontWeight: 'bold',
        color: 'white',
    },
    inviteIconContainer: {
        marginLeft: 15,
        position: 'relative',
    },
    menuContainer: {
        marginTop: 30,
        paddingHorizontal: Spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FDF2E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
});

export default ProfileScreen;
