import { View, Text, StyleSheet, Dimensions } from 'react-native';
import React, { useState} from 'react';

import IconButtonCup from '../components/IconButtonCup';
import IconButtonProfile from '../components/IconButtonProfile';
import GoogleMap from '../components/GoogleMap';

import cup from '../assets/cup2.png';
import defUser from '../assets/userdefault.jpg';


const Map = ({ navigation }) => {

    const [name, setName] = useState(null);
    const [img, setImg] = useState(null);

    return (
        <View style={styles.containerBG}>

            <View style={styles.containerBG}>
                <GoogleMap/>
            </View>

            
            <IconButtonCup 
                onPress={() => navigation.navigate('Classification',
                    { name: 'Classification-View' }
                )}
                iconSource={cup}
            />
            <IconButtonProfile 
                navigation={navigation}  
            />
    
        </View>
    );
}

const styles = StyleSheet.create({
    containerBG: {
        flex: 1,
    },
});

export default Map;