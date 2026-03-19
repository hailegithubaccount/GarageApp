import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../theme/Colors';
import ProfileScreen from '../ProfileScreen';

const BookingsScreen = () => (
    <SafeAreaView style={styles.container}>
        <Text style={styles.text}>My Bookings</Text>
    </SafeAreaView>
);

const SavedScreen = () => (
    <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Saved Garages</Text>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    text: { fontSize: 22, fontWeight: 'bold', color: Colors.secondary },
});

export { BookingsScreen, SavedScreen, ProfileScreen };
