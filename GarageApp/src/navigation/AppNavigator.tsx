import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LocationScreen from '../screens/LocationScreen';
import VehicleRegistrationScreen from '../screens/VehicleRegistrationScreen';
import GarageDetailScreen from '../screens/GarageDetailScreen';
import MyVehiclesScreen from '../screens/MyVehiclesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import BottomNavigator from './BottomNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen name="VehicleRegistration" component={VehicleRegistrationScreen} />
            <Stack.Screen name="GarageDetail" component={GarageDetailScreen} />
            <Stack.Screen name="MyVehicles" component={MyVehiclesScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Home" component={BottomNavigator} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
