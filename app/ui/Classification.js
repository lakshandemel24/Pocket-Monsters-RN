import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { List, Avatar } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BottomSheet from '../components/BottomSheet';
import CommunicationController from '../api/CommunicationController';
import img from '../assets/player.png';

// Component for rendering individual player items
const Item = ({ player, onPress }) => (
  <List.Item
    title={player.name}
    description={"Experience: " + player.experience}
    left={props => <Avatar.Image style = {{marginLeft: 5}} size={53} source={player.picture ? {uri: 'data:image/png;base64,' + player.picture} : img} />}
    right={props => <Text style = {{fontSize: 20, marginTop: 17, fontWeight: 'bold'}}>{player.experience}</Text>}
    onPress={onPress}
    style= {{borderWidth: 2, borderColor: 'black', borderRadius: 10, backgroundColor: '#f2be6f', margin: 1}}
  />
);

const Classification = ( {route} ) => {

  const bottomSheetRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [playersData, setPlayersData] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

// useEffect hook to fetch user data from AsyncStorage and get players' data
  useEffect(() => {
    AsyncStorage.getItem('user').then((user) => {
      const sid = JSON.parse(user).sid;
      getPlayersData(sid)
    });

  }, []);

// Fetches ranking data and individual player data from the API
  const getPlayersData = async (sid) => {

    const users = await CommunicationController.getRanking(sid);
    let arr = [];

    for (let index = 0; index < users.length; index++) {

      let playerData = await CommunicationController.getUser(sid,users[index].uid)

      arr.push(playerData);

    }

    setPlayersData(arr);
    setLoading(false);

  }

// Opens the bottom sheet with the selected player's details
  const openBottomSheet = (p) => {
    setSelectedPlayer(p);
    bottomSheetRef.current?.expand()
  }


  return (

    <>
    {
      loading ? (
        <>
        <View style={styles.view}>
          <Button loading='true' style = {styles.buttonContent} labelStyle={{ fontSize: 50 }}/>
          </View>
        </>
      ) : (
        <>
        <View style={styles.view}>

          <GestureHandlerRootView style={styles.container}>

            <FlatList
              data={playersData}
              renderItem={({ item }) => <Item player={item} onPress={() => openBottomSheet(item)} />}
              keyExtractor={item => item.uid}
            />

            <BottomSheet 
              bottomSheetRef={bottomSheetRef}
              player={selectedPlayer}
            />

          </GestureHandlerRootView>

        </View>

        </>
      )
    }
    </>
    
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: '#8a5401'
  },
  buttonContent: {
    top: '40%',
},
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'lightgrey',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
    width: '80%',
    height: '70%',
    justifyContent: 'space-between',
  },
  btn: {
    width: '100%'
  },
});

export default Classification;
