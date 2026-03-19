import 'react-native-gesture-handler';
import React from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';




const AppContent = () => {
  const insets = useSafeAreaInsets();

  // const androidExtraPadding =
  //   Platform.OS === 'android' && Platform.Version > 29 ? 0 : 0;

  return (
    <View style={{ flex: 1, paddingBottom: Platform.OS === 'ios' ? 0 : insets.bottom }}>

      <NavigationContainer>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <AppNavigator />
      </NavigationContainer>

    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
};

export default App;
