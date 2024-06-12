import React, { useState, useCallback, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Image, TouchableOpacity, Text, Modal } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CommunicationController from '../api/CommunicationController';
import IconButtonPosition from '../components/IconButtomPosition';
import mapStyle from '../assets/mapStyle.json';
import myPos from '../assets/mypos.webp';
import monster from '../assets/monster.png';
import candy from '../assets/candy.png';
import artifact from '../assets/artifact.png';
import player from '../assets/player.png';
import lifeIcon from '../assets/heart.png';

import ModalObj from '../components/ModalObj';
import BottomSheet from '../components/BottomSheet';
import BottomSheetObjList from '../components/BottomSheetObjList';

import listObl from '../assets/search.png'

const GoogleMap = () => {

  const map = useRef(null);
  const bottomSheetRef = useRef(null);
  const bottomSheetObjListRef = useRef(null);
  const [camera, setCamera] = useState(null);
  const [Markers, setMarkers] = useState([]); 
  const [user, setUser] = useState(null);
  const [life, setLife] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObj, setSelectedObj] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [virtalObjs, setVirtualObjs] = useState(null);

  const openModal = (obj) => {
    setModalVisible(true);
    setSelectedObj(obj)
  };
  const closeModal = () => {
    setModalVisible(false);
  }
  const openBottomSheet = (marker) => {
    setSelectedPlayer(marker)
    bottomSheetRef.current.expand()
  }

  const openBottomSheetObjList = () => {
    if (bottomSheetObjListRef.current) {
      bottomSheetObjListRef.current.expand();
    } else {
      console.error("BottomSheetObjList is not ready");
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      _onMapReady();
    }, 5000); // 10000 millisecondi = 10 secondi
  }, []);

  const getMarkers = async (lat, lon) => {

    const x = await AsyncStorage.getItem('user');
    const user = await CommunicationController.getUser(JSON.parse(x).sid, JSON.parse(x).uid)
    const objs = await CommunicationController.getObjects(JSON.parse(x).sid, lat, lon)
    const users = await CommunicationController.getUsers(JSON.parse(x).sid, lat, lon)

    setUser(user);
    setLife(user.life);

    const m = objs.map((obj) => {
      return {
        id: obj.id,
        coordinate: {latitude: obj.lat, longitude: obj.lon},
        type: obj.type,
      };
    });

    const u = users.map((user) => {
      return {
        id: user.uid,
        coordinate: {latitude: user.lat, longitude: user.lon},
        type: "player",
      };
    });

    m.push(...u);

    //check doble markers by id
    const unique = m.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

    // tips filter --> const amulet = m.filter((v) => v.type === "amulet");

    //check user amulet and range
    let userCoords = {lat: lat, lon: lon}
    let maxDistance = 0;

    if (user.amulet != null) {
      let obj = await CommunicationController.getObject(JSON.parse(x).sid, user.amulet);
      maxDistance = 100 + obj.level;
    } else {
      maxDistance = 100;
    }

    let arr = [];

    for(let i = 0; i < unique.length; i++) {

      let objCoords = {lat: unique[i].coordinate.latitude, lon: unique[i].coordinate.longitude}
      let distance = calculateDistance(userCoords, objCoords);

      if (distance < maxDistance) {
        arr.push(unique[i]);
        //console.log("deleted distance: " + distance + " id " + unique[i].id + " maxDistance " + maxDistance);
      } 
        
    }

    setMarkers(arr);

    const forList = arr.filter((v) => v.type !== "player");
    
    setVirtualObjs(forList);

  }

  const _onMapReady = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      setCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        pitch: 50,
        zoom: 18,
        heading: 200,
      });

      await getMarkers(JSON.stringify(location.coords.latitude), JSON.stringify(location.coords.longitude));

    } catch (error) {
      console.log('Error getting location:', error.message);
    }
  }, []);
    

  const moveCamera = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});

      //console.log(location)
    
      map.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        pitch: 50,
        zoom: 18,
        heading: 200,
      });
    }
    catch (error) {
      console.error('Error getting location:', error.message);
    }
  };


  return (
    <View style={styles.containerBS}>
      <GestureHandlerRootView style={styles.containerBS}>
        <MapView
          ref={map}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={mapStyle}
          initialCamera={camera}
          showsMyLocationButton={false}
          showsBuildings={true}
          camera={camera}
          showsUserLocation
          showsCompass={false}
          onMapReady={_onMapReady}
        >
          {Markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              onPress={() => {
                switch (marker.type) {
                  case "player":
                    openBottomSheet(marker);
                    break;
                  default:
                    openModal(marker);
                    break;
                }
              }}
            >
              {(() => {
                switch (marker.type) {
                  case "monster":
                    return <Image source={monster} style={styles.markerIcon} />;
                  case "candy":
                    return <Image source={candy} style={styles.markerIcon} />;
                  case "player":
                    return <Image source={player} style={styles.markerIcon} />;
                  default:
                    return <Image source={artifact} style={styles.markerIcon} />;
                }
              })()}
            </Marker>
          ))}
        </MapView>
        <IconButtonPosition onPress={moveCamera} iconSource={myPos} />
        <TouchableOpacity onPress={() => openBottomSheetObjList()} style={styles.search}>
            <Image source={listObl} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContent}>
          <Image source={lifeIcon} style={styles.lifeIcon} />
          <Text style={styles.text}>{life}</Text>
        </TouchableOpacity>
        {
          modalVisible ? (
            <ModalObj
            closeModal={closeModal}
            obj={selectedObj}
            setLife={setLife}
            user={user}
            />
          ) : (
            <></>
          )
        }
         <BottomSheet 
            bottomSheetRef={bottomSheetRef}
            player={selectedPlayer}
          />
          <BottomSheetObjList
            bottomSheetObjListRef={bottomSheetObjListRef}
            user={user}
            setLife={setLife}
            virtualObjList={virtalObjs}
          />
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerIcon: {
    height: 40,
    width: 40,
  },
  lifeIcon: {
    width: 40,
    height: 40,
  },
  buttonContent: {
    position: 'absolute',
    top: 50,
    right: 10,
    borderRadius: 5,
    margin: 10,
  },
  text: {
    color: 'black',
    fontWeight: "bold",
    fontSize:18,
    position: 'absolute',
    top: 8,
    right: 40,
  },
  containerBS: {
    flex: 1,
  },
  search: {
    position: 'absolute',
    top: 58,
    left: '47%'
  },
  icon: {
    width: 40,
    height: 40,
  }
});

const calculateDistance = (pointA, pointB) => {
  const lat1 = pointA.lat;
  const lon1 = pointA.lon;
  const lat2 = pointB.lat;
  const lon2 = pointB.lon;

  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres

  return d;
}

export default GoogleMap;
