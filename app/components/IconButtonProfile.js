import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar, MD3Colors, Avatar, Button } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';

import img from '../assets/playerIcon.png';

const IconButton = ({ navigation }) => {

    /*const response = await CommunicationController.getUser('ZhyeEJ5lbtgFJ5BFBTvi', 1007)*/

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function dbT() {
        const db = SQLite.openDatabase('PocketMonsters');

        const selectUser = `
        SELECT * FROM USER;
        `;

        await db.transactionAsync(async tx => {
            const result = await tx.executeSqlAsync(selectUser, []);
            setUser(result.rows[0]);
            setLoading(false);
        }).catch(error => {
            console.log("Errore nella query: " + error);
            setLoading(false);
        });
    }

    useEffect(() => {
        dbT();
    }, []);


    return (
        <>
            {loading ? (
                <Button loading='true' style = {styles.buttonContent} />
            ) : (
                user &&
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Profile', {sid: user.sid, source: 'Mappa'})} 
                    style={styles.buttonContent}
                >
                    <Avatar.Image size={70} source={img} style={styles.img} />
                </TouchableOpacity>
            )}
            
        </>
    );
}

const styles = StyleSheet.create({
    buttonContent: {
        position: 'absolute',
        bottom: 15,
        right: 13,
        borderRadius: 50,
        margin: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'black',
    },
    icon: {
        width: 50,
        height: 50,
    },
    text: {
        color: 'black',
        fontWeight: "bold",
        fontSize:15,
        textShadowColor:'white',
        textShadowOffset:{width: 5, height: 1},
        textShadowRadius:10,
    },
    img: {
        backgroundColor: 'lightyellow',
        borderWidth: 0,
        borderColor: "black",
    },
    pb : {
        backgroundColor: 'lightgrey',
    }
});

export default IconButton;