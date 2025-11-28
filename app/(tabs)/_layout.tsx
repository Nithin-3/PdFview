import { FileProgressProvider } from '@/components/filesave';
import { Stack } from 'expo-router';
import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';


export default function TabLayout() {

    return (
        <FileProgressProvider>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <Stack>
                    <Stack.Screen name='index' options={{ headerShown: false }} />
                    <Stack.Screen name='pdf' />
                </Stack>
            </TouchableWithoutFeedback>
        </FileProgressProvider>
    );
}
