import * as React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import  Map from '../ui/Map';
import Classification from '../ui/Classification';
import Profile from '../ui/Profile';

const Stack = createNativeStackNavigator();

export default function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                    backgroundColor: '#8a5401', // Background color of the header
                    height: 50, // Height of the header
                    },
                    headerTintColor: '#fff', // Text color of the header
                    headerTitleStyle: {
                    fontWeight: 'bold', // Style of the header title
                    },
                }}
            >
                <Stack.Screen name="Map" component={Map} options={{ headerShown: false }} />
                <Stack.Screen name="Classification" component={Classification} />
                <Stack.Screen name="Profile" component={Profile} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}