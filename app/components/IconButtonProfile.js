import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar, MD3Colors, Avatar, Button } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';

import img from '../assets/userdefault.jpg';

const IconButton = ({ onPress, navigation }) => {

    /*const response = await CommunicationController.getUser('ZhyeEJ5lbtgFJ5BFBTvi', 1007)*/

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState(null);

    async function dbT() {
        const db = SQLite.openDatabase('PocketMonsters');

        const selectUser = `
        SELECT * FROM USER;
        `;

        await db.transactionAsync(async tx => {
            const result = await tx.executeSqlAsync(selectUser, []);
            setUser(result.rows[0]);
            setName(result.rows[0].name)
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
                    onPress={() => navigation.navigate('Profile',
                        { 
                            name:  name, 
                            setName: setName
                        }
                    )} 
                    style={styles.buttonContent}
                >
                    <Avatar.Image size={70} source={user.picture ? {uri: 'data:image/png;base64,' + user.picture} : img} style={styles.img} />
                    <Text style={styles.text}>{name}</Text>
                    {/*<Text style={styles.text}>Lv. {parseInt(user.experience/100)}</Text>*/}
                    {/*<ProgressBar progress={user.experience%100/100} color={'purple'} style={styles.pb}/>*/}
                </TouchableOpacity>
            )}
            
        </>
    );
}

const styles = StyleSheet.create({
    buttonContent: {
        position: 'absolute',
        bottom: 13,
        right: 13,
        borderRadius: 5,
        margin: 10,
        alignItems: 'center'
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