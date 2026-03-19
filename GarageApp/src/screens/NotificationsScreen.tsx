import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/Colors';
import { Spacing } from '../theme/Spacing';
import { getNotifications$, markAsRead$, markAllAsRead$ } from '../api/notifications';

const NotificationsScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications$();
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead$(id);
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead$();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
            onPress={() => handleMarkAsRead(item._id)}
        >
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: item.isRead ? '#F3F4F6' : Colors.primary + '20' }]}>
                    <Ionicons
                        name={item.type === 'service_update' ? 'construct' : 'notifications'}
                        size={20}
                        color={item.isRead ? '#6B7280' : Colors.primary}
                    />
                </View>
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {notifications.some(n => !n.isRead) ? (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 80 }} />
                )}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
    },
    markAllText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#9CA3AF',
    },
    listContent: {
        paddingVertical: 10,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        marginBottom: 1,
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: '#F0F9FF',
    },
    iconContainer: {
        marginRight: 15,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    unreadText: {
        color: Colors.black,
    },
    message: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    time: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 5,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginLeft: 10,
    },
});

export default NotificationsScreen;
