import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: 'AIzaSyA18JVjA2sAeFJljhRbSnIq6oReK65DJpM',
  authDomain: 'nonabel-transport.firebaseapp.com',
  projectId: 'nonabel-transport',
  storageBucket: 'nonabel-transport.appspot.com',
  messagingSenderId: '376259383046',
  appId: '1:376259383046:web:d3ad95491fd70583615887',
  measurementId: 'G-T7L8LFDFZ5'
};

firebase.initializeApp(firebaseConfig);

export default firebase;
