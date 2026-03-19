import React from 'react';
import { Text, Platform, StyleSheet, View, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Project imports mapped from template
import Home from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import { BookingsScreen as History, SavedScreen as StatDetail } from '../screens/tabs';
import Settings from '../screens/ProfileScreen';
import { Colors } from '../theme/Colors';
import { useTranslationStore } from '../store/translatonStore';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
    return (
        <View style={styles.iconContainer}>
            <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />
            {focused && <View style={styles.activeDot} />}
        </View>
    );
};

function BottomNavigator() {
    const { translation } = useTranslationStore(({ translation }: any) => ({ translation }));
    const local = translation.bottom;

    const tabs = [
        { name: 'home', component: Home, icon: 'home', label: 'Home' },
        { name: 'explore', component: ExploreScreen, icon: 'search', label: 'Explore' },
        { name: 'bookings', component: History, icon: 'calendar', label: 'Bookings' },
        { name: 'saved', component: StatDetail, icon: 'briefcase', label: 'Saved' },
        { name: 'profile', component: Settings, icon: 'person', label: 'Profile' },
    ];

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
                tabBarHideOnKeyboard: true,
            }}>
            {tabs.map((tab) => (
                <Tab.Screen
                    key={tab.name}
                    name={tab.name}
                    component={tab.component}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <View style={styles.tabItem}>
                                <TabBarIcon
                                    name={tab.icon}
                                    focused={focused}
                                    color={focused ? Colors.primary : '#9CA3AF'}
                                />
                                <Text
                                    style={[
                                        styles.tabLabel,
                                        { color: focused ? Colors.primary : '#9CA3AF' }
                                    ]}>
                                    {tab.label}
                                </Text>
                            </View>
                        ),
                    }}
                />
            ))}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.OS === 'ios' ? 88 : 68,
        backgroundColor: Colors.white,
        borderTopWidth: 0,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 8,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        zIndex: 1000,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 4,
        width: width / 5,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 28,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        position: 'absolute',
        bottom: -4,
    }
});

export default BottomNavigator;
