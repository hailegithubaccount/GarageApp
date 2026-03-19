import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { ExploreScreen, BookingsScreen, SavedScreen, ProfileScreen } from '../screens/tabs';
import { Colors } from '../theme/Colors';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }: { label: string; focused: boolean }) => {
    let icon = '🏠';
    if (label === 'Explore') icon = '📍';
    if (label === 'Bookings') icon = '📅';
    if (label === 'Saved') icon = '💼';
    if (label === 'Profile') icon = '👤';

    return (
        <View style={styles.tabItem}>
            <Text style={[styles.tabIcon, { color: focused ? Colors.primary : '#9CA3AF' }]}>{icon}</Text>
            <Text style={[styles.tabLabel, { color: focused ? Colors.primary : '#9CA3AF' }]}>{label}</Text>
        </View>
    );
};

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
            })}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={HomeScreen} 
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
            />
            <Tab.Screen 
                name="Explore" 
                component={ExploreScreen} 
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Explore" focused={focused} /> }}
            />
            <Tab.Screen 
                name="Bookings" 
                component={BookingsScreen} 
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Bookings" focused={focused} /> }}
            />
            <Tab.Screen 
                name="Saved" 
                component={SavedScreen} 
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Saved" focused={focused} /> }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} /> }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        position: 'absolute',
        bottom: 0,
        elevation: 10,
        borderTopWidth: 0,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        top: 10,
    },
    tabIcon: {
        fontSize: 22,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '600',
    },
});

export default MainTabNavigator;
