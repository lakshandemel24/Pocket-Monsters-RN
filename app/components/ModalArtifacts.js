import { Text, View, Modal, StyleSheet, Button, Image } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function App({closeModal, obj}) {
    
    const [objCont, setObjCont] = useState(null);
    const [loading, setLoading] = useState(true);
    const [img, setImg] = useState(null);

    useEffect(() => {

        switch (obj.type) {
            case 'monster':
                setImg(require('../assets/monster.png'));
                break;
            case 'candy':
                setImg(require('../assets/candy.png'));
                break;
            default: 
                setImg(require('../assets/artifact.png'));
        }   
        setObjCont(obj);
        setLoading(false);

    }, []);


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
                        <Text style = {styles.title} >{objCont.name}</Text>

                        <Image
                            source={objCont.image ? {uri: 'data:image/png;base64,' + objCont.image} : img}
                            style={{width: 170, height: 170}}
                        />

                        <Text style={{fontSize: 23, padding: 0, fontWeight: 'bold'}} >Level: {objCont.level}</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Button title="Close" style={{ alignSelf: 'flex-start'}} color="grey" onPress = {
                                () => closeModal()
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
        height: '50%',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 27,
        fontWeight: 'bold',
    },
});