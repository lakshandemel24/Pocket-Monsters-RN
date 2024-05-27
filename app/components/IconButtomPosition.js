import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

const IconButtonPosition = ({ onPress, iconSource }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.buttonContent}>
            <Image source={iconSource} style={styles.icon} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonContent: {
        position: 'absolute',
        bottom: 30,
        left: 18,
        borderRadius: 5,
        margin: 10,
    },
    icon: {
        width: 50,
        height: 50,
    },
});

export default IconButtonPosition;