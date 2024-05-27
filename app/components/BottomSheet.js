import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useCallback, useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button } from 'react-native-paper';

import CommunicationController from '../api/CommunicationController';
import img from '../assets/player.png';
import mapStyle from '../assets/mapStyle.json';

export default function App({ bottomSheetRef, player }) {

  const snapPoints = useMemo(() => ['1%', '88%'], []);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [positionShare, setPositionShare] = useState(false);
  const [camera, setCamera] = useState(null);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} enableTouchThrough={true} />,
    []
  );

  const handleBottomSheetChanges = (index) => {
    if (snapPoints[index] !== '88%') {
        bottomSheetRef.current?.close();
        setPlayerLoaded(false);
    } else {
        
        const fetchPlayerInfo = async () => {
            try {
                let id = null;
                if(player.id == undefined) {
                  id = player.uid;
                } else {
                  id = player.id;
                }
                const p = await AsyncStorage.getItem('user');
                const sid = JSON.parse(p).sid;
                //TO DO: DB get player info if exists
                const playerInfo = await CommunicationController.getUser(sid, id);
                setPlayerInfo(playerInfo);
                setPositionShare(playerInfo.positionshare);
                setCamera({
                  center: {
                    latitude: playerInfo.lat,
                    longitude: playerInfo.lon,
                  },
                  pitch: 50,
                  zoom: 18,
                  heading: 0,
                });
                setPlayerLoaded(true);
            } catch (error) {
                console.log(error);
            }
        };

        fetchPlayerInfo();

    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      onChange={handleBottomSheetChanges}
      backgroundStyle={{ backgroundColor: '#fadeb4' }}
    >
      {
        playerLoaded ? (
          <View style={styles.contentContainer}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{playerInfo.name}</Text>
              <Image 
                source={playerInfo.picture ? {uri: 'data:image/png;base64,' + playerInfo.picture} : img}
                style={{width: 170, height: 170, marginTop: 50}}
              />
            </View>
            <View style={styles.playerStats}>
              <Text style={styles.statText}>Life: {playerInfo.life}</Text>
              <Text style={styles.statText}>Experience: {playerInfo.experience}</Text>
            </View>
            {positionShare ? (
              <>
                <Text style={styles.closeText}>Position</Text>
                <View style={{ borderWidth: 2, borderColor: 'black', marginTop: 15 }}>
                  <MapView
                    style={{ width: '100%', height: 300}}
                    provider={PROVIDER_GOOGLE}
                    initialCamera={camera}
                    showsCompass={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: playerInfo.lat,
                        longitude: playerInfo.lon,
                      }}
                      title={playerInfo.name}
                      style={{ width: 40, height: 40 }}
                    >
                      <Image source={img} style={{ width: 40, height: 40 }} />
                    </Marker>
                  </MapView>
                </View>
              </>
              ) : (
                <Text style={styles.closeText}>Player is not sharing position</Text>
              )
            }
            
          </View>
        ) : (
          <Button loading='true' style = {{top: '40%'}} labelStyle={{ fontSize: 50 }}/>
        )
      }

      
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  playerInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  playerName: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  playerStats: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  statText: {
    fontSize: 20,
    marginBottom: 5,
  },
  closeText: {
    alignSelf: 'center',
    fontSize: 14,
    color: 'gray',
  },
});
