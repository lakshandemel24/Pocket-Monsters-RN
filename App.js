import React, { useEffect, useState } from 'react';
import Navigation from './app/navigation/Navigation';
import CommunicationController from './app/api/CommunicationController';
import { View, Image, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

export default function App() { 

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const registerUser = async () => {
    try {
      // Simulate registration delay
      setTimeout(async () => {
        // Check if user is already registered
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setUser(JSON.parse(user));
          console.log("User already registered: " + user);
          await dbSetUp(user);
          return;
        } else {
          const userData = await CommunicationController.register();
          //userData = { sid: "ZhyeEJ5lbtgFJ5BFBTvi", uid: 1007}; RAMBO
          setUser(userData); 
          console.log("registering user: " + JSON.stringify(userData));
          await AsyncStorage.setItem('user', JSON.stringify(userData));
          await dbSetUp(JSON.stringify(userData));
        }
      }, 2000); // 5000 milliseconds = 5 seconds
    } catch (error) {
      console.error("useRegister Errors: " + error);
      setLoading(false);
    }
  };

  async function dbSetUp(user) {

    const db = SQLite.openDatabase('PocketMonsters');
    const sid = JSON.parse(user).sid;
    const uid = JSON.parse(user).uid;

    const createTable = `
      CREATE TABLE IF NOT EXISTS USER (
        sid TEXT PRIMARY KEY NOT NULL,
        uid INTEGER NOT NULL,
        name TEXT,
        life INTEGER,
        experience INTEGER,
        weapon INTEGER,
        armor INTEGER,
        amulet INTEGER,
        picture TEXT,
        positionShare BOOL,
        profileversion INTEGER
      );
    `;

    await db.transactionAsync(async tx => {
      await tx.executeSqlAsync(createTable, []);
    }).catch(error => {
      console.log("error creating table User: " + error)
    });

    const profileversionQuery = `
      SELECT profileversion FROM USER WHERE sid = ? AND uid = ?;
    `;

    await db.transactionAsync(async tx => {

      const getDbProfileversion = await tx.executeSqlAsync(profileversionQuery, [sid, uid]);
      const updatedUSer = await CommunicationController.getUser(JSON.parse(user).sid, JSON.parse(user).uid);
      
      const dbProfileversion = getDbProfileversion.rows;

      if (dbProfileversion.length == 0) {

        console.log("User not found in db, inserting new user " + updatedUSer.name);
        
        const insertUser = `
          INSERT INTO USER (sid, uid, name, positionShare, profileversion, life, experience, weapon, armor, amulet, picture)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          WHERE NOT EXISTS (
            SELECT 1 FROM USER WHERE sid = ? AND uid = ?
          );
        `;
        
        await tx.executeSqlAsync(insertUser, [sid, uid, updatedUSer.name, updatedUSer.positionShare, updatedUSer.profileversion, updatedUSer.life, updatedUSer.experience, updatedUSer.weapon, updatedUSer.armor, updatedUSer.amulet, updatedUSer.picture, sid, uid]);
        console.log("User inserted in db");

      } else if(dbProfileversion[0].profileversion != updatedUSer.profileversion) {

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

    //console.log('DB setup completed');
    setLoading(false);
  }

  useEffect(() => {
    registerUser();
  }, []);

  return (
    <>
      {loading ? (
        <View style={styles.container}>
          <Image source={require('./app/assets/cut-loop.gif')} style={styles.logo}/>
        </View>
      ) : (
        user && <Navigation />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  logo: {
    width: 400,
    height: 400,
  },
});

