import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import CommunicationController from '../api/CommunicationController';
import { Avatar, Button, TextInput, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

import ModalArtifacts from '../components/ModalArtifacts';
import ModalModifyVisible from '../components/ModalModify.js';

import imgUs from '../assets/userdefault.jpg';
import img from '../assets/artifact.png'
import modify from '../assets/modify.png'

export default function App({route}) {

  const [loading, setLoading] = useState(true);
  const [sid, setSid] = useState(null);
  const [uid, setUid] = useState(null);
  const [userDataFromServer, setuserDataFromServer] = useState(null);
  const [userDataFromDB, setuserDataFromDB] = useState(null);
  const [armor, setArmor] = useState(null);
  const [weapon, setWeapon] = useState(null);
  const [amulet, setAmulet] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObj, setSelectedObj] = useState(null);
  const [image, setImage] = useState(null);
  const [modalModifyVisible, setModalModifyVisible] = useState(false);
  const [name, setName] = useState(null);

  const toggleSwitch = async () => {
    setIsEnabled(previousState => !previousState);
    try {
      await CommunicationController.modifyUserPositionShare(sid, uid, !isEnabled);
    } catch(error) {
      console.log(error);
    }
  }
  const openModal = (obj) => {
    setModalVisible(true);
    setSelectedObj(obj)
  };
  const closeModal = () => {
    setModalVisible(false);
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      //await CommunicationController.modifyUserProfilePicture(sid, uid, result.assets[0].uri)

      const filePath = result.assets[0].uri;

      try {

        const fileInfo = await FileSystem.getInfoAsync(filePath);
        const fileSizeInKB = fileInfo.size / 1024;

        if(fileSizeInKB > 100) {
          Alert.alert('Error', 'Image too big, max 100KB');
          return;
        }

        const content = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.Base64 });
        await CommunicationController.modifyUserProfilePicture(sid, uid, content);
        setImage('data:image/png;base64,' + content);
      } catch (error) {
        console.error('Erroraccio: ' + error);
      }
      
    } else {
      Alert.alert('Error', 'No image selected');
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('user').then((user) => {
      const sid = JSON.parse(user).sid;
      const uid = JSON.parse(user).uid;
      setSid(sid);
      setUid(uid);
      getUserData(sid,uid);
      //console.log(route)
    });

  }, []);

  const getUserData = async (sid, uid) => {

    const db = SQLite.openDatabase('PocketMonsters');

    const profileversionQuery = `
      SELECT profileversion FROM USER WHERE sid = ? AND uid = ?;
    `;

    await db.transactionAsync(async tx => {

      const getDbProfileversion = await tx.executeSqlAsync(profileversionQuery, [sid, uid]);
      const updatedUSer = await CommunicationController.getUser(sid, uid);
      setuserDataFromServer({ armor: updatedUSer.armor, weapon: updatedUSer.weapon, amulet: updatedUSer.amulet, life: updatedUSer.life, experience: updatedUSer.experience })
      
      if(updatedUSer.armor != null) {
        let ar = await CommunicationController.getObject(sid, updatedUSer.armor);
        setArmor(ar);
      }
      if(updatedUSer.amulet != null) {
        let am = await CommunicationController.getObject(sid, updatedUSer.amulet);
        setAmulet(am);
      }
      if(updatedUSer.weapon != null) {
        let we = await CommunicationController.getObject(sid, updatedUSer.weapon);
        setWeapon(we);
      }

      if(updatedUSer.positionshare == null) {
        setIsEnabled(false);
      } else {
        setIsEnabled(updatedUSer.positionshare);
      }

      const dbProfileversion = getDbProfileversion.rows;

      if(dbProfileversion[0].profileversion != updatedUSer.profileversion) {

          const updateUser = `
            UPDATE USER
            SET name = ?, positionShare = ?, profileversion = ?, life = ?, experience = ?, weapon = ?, armor = ?, amulet = ?, picture = ?
            WHERE sid = ? AND uid = ?;
          `;

          await tx.executeSqlAsync(updateUser, [updatedUSer.name, updatedUSer.positionShare, updatedUSer.profileversion, updatedUSer.life, updatedUSer.experience, updatedUSer.weapon, updatedUSer.armor, updatedUSer.amulet, updatedUSer.picture, sid, uid]);
        
      } 
    }).catch(error => {
      console.log("error getting profileversion: " + error);
    });

    const imgQuery = `
      SELECT * FROM USER WHERE sid = ? AND uid = ?;
    `;

    await db.transactionAsync(async tx => {

      const x = await tx.executeSqlAsync(imgQuery, [sid, uid]);
      let d = x.rows[0];
      let ps = null;

      setuserDataFromDB({ name: d.name, picture: d.picture, positionShare: ps, profileversion: d.profileversion })
      setName(d.name)
      setLoading(false)

    }).catch(error => {
      console.log("error gentting profilepicture: " + error);
    });

  }

  const openModifyModal = () => {

    setModalModifyVisible(true);
      
  }

  return (

    <>
    {
      loading ? (

        <>
        <View style={styles.view}>
          <Button loading='true' style = {{top: '40%'}} labelStyle={{ fontSize: 50 }}/>
        </View>
        </>

      ) : (

        <>
        <View style = {{flex: 1, backgroundColor: '#f2be6f'}}>
          <View style={styles.view}>
            <TouchableOpacity onPress={pickImage}>
              {  image ? (
                  <Avatar.Image size={180} source={{uri: image}} />
                ) : (
                  <Avatar.Image size={180} source={userDataFromDB.picture ? {uri: 'data:image/png;base64,' + userDataFromDB.picture} : imgUs} />
                )
              }
            </TouchableOpacity>
            <View style = {{ flexDirection: 'row', left: 25 }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 10 }} >{name}</Text>
            <TouchableOpacity onPress={() => openModifyModal()}>
              <IconButton size={35}  icon={modify} />
            </TouchableOpacity>
            </View>
          </View>
          <View style={styles.playerStats}>
            <Text style={styles.statText}>Life: {userDataFromServer.life}</Text>
            <Text style={styles.statText}>Experience: {userDataFromServer.experience}</Text>
          </View>
          <View style={styles.playerEqView}>
            {armor !== null && (
             <TouchableOpacity onPress={() => openModal(armor)} style={styles.itemContainer}>
                <Image source={armor.image ? {uri: 'data:image/png;base64,' + armor.image} : img} style={styles.playerEq} />
                <Text style={styles.statEqText}>Armor</Text>
              </TouchableOpacity>
            )}
            {weapon !== null && (
              <TouchableOpacity onPress={() => openModal(weapon)} style={styles.itemContainer}>
                <Image source={weapon.image ? {uri: 'data:image/png;base64,' + weapon.image} : img} style={styles.playerEq} />
                <Text style={styles.statEqText}>Weapon</Text>
              </TouchableOpacity>

            )}
            {amulet !== null && (
              <TouchableOpacity onPress={() => openModal(amulet)} style={styles.itemContainer}>
                <Image source={amulet.image ? {uri: 'data:image/png;base64,' + amulet.image} : img} style={styles.playerEq} />
                <Text style={styles.statEqText}>Amulet</Text>
              </TouchableOpacity>
            )}
            {amulet == null && armor == null && weapon == null && (
              <View style={styles.itemContainer}>
                <Text style = {{ fontSize: 20, fontWeight: 'bold', fontStyle: 'italic' }} >No artifacts</Text>
              </View>
            )}
          </View>

          <View style = {{position: 'absolute', bottom: 20, left: '45%'}}>
            <Switch
              trackColor={{false: '#767577', true: '#81b0ff'}}
              thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
              style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
            />
          </View> 

          {
            modalVisible ? (
              <ModalArtifacts
                closeModal={closeModal}
                obj={selectedObj}
              />
            ) : (
              <></>
            )
          }

          {
            modalModifyVisible ? (
              <ModalModifyVisible
                closeModal={setModalModifyVisible}
                name={name}
                setName={setName}
                sid={sid}
                uid={uid}
              />
            ) : (
              <></>
            )
          }

        </View>
        
        </>
       
      )
    }
    </>
    
  
  );
}

const styles = StyleSheet.create({
  view: {
    alignItems: 'center',
    top: '7%'
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '10%',
    top: '15%',
  },
  playerEqView: {
    flexDirection: 'row',
    top: '15%',
    justifyContent: 'center'
  },
  playerEqCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: '10%',
    paddingRight: '10%',
    marginTop: '15%'
  },
  statText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statEqText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerEq: {
    height: 100,
    width: 100,
    borderRadius: 20,
  },
  itemContainer: {
    padding: '5%',
    alignItems: 'center'
  }
});