import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useCallback, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { List, Avatar } from 'react-native-paper';
import { FlatList } from 'react-native-gesture-handler';

import monster from '../assets/monster.png';
import candy from '../assets/candy.png';
import artifact from '../assets/artifact.png';

import ModalObj from '../components/ModalObj';


export default function App({ bottomSheetObjListRef, user, setLife, virtualObjList }) {

    const snapPoints = useMemo(() => ['1%', '88%'], []);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedObj, setSelectedObj] = useState(null);

    const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} enableTouchThrough={true} />,
    []
    );

    const handleBottomSheetChanges = (index) => {
    if (snapPoints[index] !== '88%') {
        bottomSheetObjListRef.current?.close();
    }
    }

    const openModal = (obj) => {
        setModalVisible(true);
        setSelectedObj(obj)
    };
    const closeModal = () => {
        setModalVisible(false);
    }

    const Item = ({ obj, onPress }) => (
        <List.Item
            title={obj.type}
            description={"ID: " + obj.id}
            left={props => <Avatar.Image style = {{marginLeft: 5}} size={45} source={obj.type == 'monster' ? monster : obj.type == 'candy' ? candy : artifact} />}
            onPress={() => openModal(obj)}
            style= {{borderWidth: 2, borderColor: 'black', borderRadius: 10, backgroundColor: '#f2be6f', margin: 1}}
        />
    );

  return (

        <BottomSheet
        ref={bottomSheetObjListRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        onChange={handleBottomSheetChanges}
        backgroundStyle={{ backgroundColor: '#fadeb4' }}
        >
        
        <View style={{ flex: 1 }}>

        <View style={styles.title}>
                <Text style={styles.titleText}>Nearby Virtual Objects</Text>
            </View>

        {/* LIST VIRTUAL OBJ */}

            <FlatList
                data={virtualObjList}
                renderItem={({ item }) => <Item obj={item}/>}
                keyExtractor={item => item.id}
                style={{ flex: 1 }}
            />

        </View>

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
           
           
        </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    top: 5
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
  },
});
