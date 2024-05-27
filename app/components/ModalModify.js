import { Text, View, Modal, StyleSheet, Button, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import {TextInput} from 'react-native-paper';
import CommunicationController from '../api/CommunicationController';

export default function App({closeModal, name, setName, sid, uid}) {
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(false);

    }, []);

    const close = async (n) => {
        closeModal(false);
        try {

            await CommunicationController.modifyUserName(sid, uid, n)
            
        } catch (error) {

            console.log(error);
            
        }
    }


    return (
        <Modal
        transparent={true}
        onRequestClose={() => {
          modalVisible;
        }}
        >
           {loading ? (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text>Loading...</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style = {styles.title} >Modify Name</Text>

                        <TextInput
                            label="Username"
                            value={name}
                            onChangeText={text => setName(text)}
                            style = {{width: 200, backgroundColor: '#f2be6f', fontWeight: 'bold'}}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Button title="Done" style={{ alignSelf: 'flex-start'}} color="green" onPress = {
                                () => close(name)
                            } />
                        </View>
                    </View>
                </View>
            )}
        </Modal>
    );
    
}


const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      },
    modalContent: {
        backgroundColor: '#fadeb4',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        width: '80%',
        height: '30%',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 27,
        fontWeight: 'bold',
    },
});