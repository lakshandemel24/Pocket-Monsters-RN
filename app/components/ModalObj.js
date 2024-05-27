import { Text, View, Modal, StyleSheet, Button, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import CommunicationController from '../api/CommunicationController';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

export default function App({closeModal, obj, setLife, user}) {
    
    const [objCont, setObjCont] = useState(null);
    const [weapon, setWeapon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sid , setSid] = useState(null);
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
        
        AsyncStorage.getItem('user').then((user) => {
            const sid = JSON.parse(user).sid;
            setSid(sid);
            setUpModal(obj, sid);
        });

    }, []);

    const setUpModal = async ( obj,sid ) => {

        if(user.weapon != null) {
            const weapon = await CommunicationController.getObject(sid, user.weapon);
            setWeapon(weapon);
        }
    
        const db = SQLite.openDatabase('PocketMonsters');
    
        const createTable = `
            CREATE TABLE IF NOT EXISTS OBJECTS (
                id INTEGER NOT NULL,
                name TEXT,
                level INTEGER,
                image TEXT,
                type TEXT
            );
        `;
        await db.transactionAsync(async tx => {
            await tx.executeSqlAsync(createTable, []);
        }).catch(error => {
            console.log("error creating table Objects: " + error)
        });
    
        let objInDb = false;
        const query = `SELECT * FROM OBJECTS WHERE id = ?`;
    
        await db.transactionAsync(async tx => {
    
            let objDataDb = await tx.executeSqlAsync(query, [obj.id]);
            if (objDataDb.rows.length > 0) {
                objInDb = true;
                setObjCont(objDataDb.rows[0]);
                setLoading(false);
                console.log("Object in db " + objDataDb.rows[0].name);
            } else {
                objInDb = false;
            }
        
        }).catch(error => {
          console.log("error getting profileversion: " + error);
        });
    
        if (!objInDb) {
            console.log("Object not in db, getting object from server");
            const objData = await CommunicationController.getObject(sid, obj.id);
            setObjCont(objData);
            setLoading(false);
            console.log(objData.name);
            const insertObj = `
                INSERT INTO OBJECTS (id, name, level, image, type)
                SELECT ?, ?, ?, ?, ?
                WHERE NOT EXISTS (
                    SELECT 1 FROM OBJECTS WHERE id = ?
                );
            `;
            await db.transactionAsync(async tx => {
                await tx.executeSqlAsync(insertObj, [objData.id, objData.name, objData.level, objData.image, objData.type, objData.id]);
            }).catch(error => {
                console.log("error inserting object: " + error);
            });
        }

    }

    const ActiveObj = async (id, sid) => {
        closeModal();
        const response = await CommunicationController.activateObject(sid, id);
        setLife(response.life);
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
                        <Text style = {styles.title} >{objCont.name}</Text>

                        <Image
                            source={objCont.image ? {uri: 'data:image/png;base64,' + objCont.image} : img}
                            style={{width: 170, height: 170}}
                        />

                        <Text style={{fontSize: 23, padding: 0, fontWeight: 'bold'}} >Level: {objCont.level}</Text>
                        <Text style={{fontSize: 20, top: 0, fontWeight: 'bold', fontStyle: 'italic'}} >({objCont.type})</Text>
                        {(() => { 
                            if (objCont.type == 'monster') {
                                let minDamage, maxDamage;
                                if (user.weapon != null) {
                                    minDamage = Math.floor(objCont.level - (objCont.level * weapon.level/100));
                                    maxDamage = Math.floor((objCont.level - (objCont.level * weapon.level/100)) * 2);
                                } else {
                                    minDamage = Math.floor(objCont.level);
                                    maxDamage = Math.floor(objCont.level * 2);
                                }
                                return <Text>Possible damage range: {minDamage} - {maxDamage}</Text>;
                            }
                        })()}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Button title="Close" style={{ alignSelf: 'flex-start'}} color="grey" onPress = {
                                () => closeModal()
                            } />
                            <View style={{ width: 20 }} /> 
                            <Button title="Activate" color='green' onPress = {
                                () => ActiveObj(objCont.id, sid)
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
        height: '75%',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 27,
        fontWeight: 'bold',
    },
});