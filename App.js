import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Linking, AppState } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function App() {
  const [cameraPermission, setCameraPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [micPermission, setMicPermission] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  const checkPermissions = async () => {
    const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: micStatus } = await Audio.requestPermissionsAsync();

    setCameraPermission(camStatus);
    setLocationPermission(locStatus);
    setMicPermission(micStatus);

    if (camStatus !== 'granted') showAlert('cámara');
    if (locStatus !== 'granted') showAlert('ubicación');
    if (micStatus !== 'granted') showAlert('micrófono');
  };

  const showAlert = (perm) => {
    Alert.alert(
      `Permiso de ${perm} denegado`,
      `Activa el permiso de ${perm} desde la configuración del dispositivo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir configuración', onPress: () => Linking.openSettings() }
      ]
    );
  };

  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener('change', nextState => {
      if (appState.match(/inactive|background/) && nextState === 'active') {
        checkPermissions(); 
      }
      setAppState(nextState);
    });
    return () => subscription.remove();
  }, []);

  const getColor = (status) => (status === 'granted' ? 'green' : 'red');
  const getIcon = (status) => (status === 'granted' ? 'check-circle' : 'cancel');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Gestión de Permisos</Text>

      <View style={styles.row}>
        <Icon name={getIcon(cameraPermission)} size={24} color={getColor(cameraPermission)} />
        <Text style={[styles.label, { color: getColor(cameraPermission) }]}>
          Cámara: {cameraPermission === 'granted' ? 'Permitido' : 'Denegado'}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon name={getIcon(locationPermission)} size={24} color={getColor(locationPermission)} />
        <Text style={[styles.label, { color: getColor(locationPermission) }]}>
          Ubicación: {locationPermission === 'granted' ? 'Permitido' : 'Denegado'}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon name={getIcon(micPermission)} size={24} color={getColor(micPermission)} />
        <Text style={[styles.label, { color: getColor(micPermission) }]}>
          Micrófono: {micPermission === 'granted' ? 'Permitido' : 'Denegado'}
        </Text>
      </View>

      <Button title="🔄 Verificar nuevamente permisos" onPress={checkPermissions} />

      <Text style={styles.help}>
        Esta app necesita acceso a la cámara para tomar fotos, ubicación para mostrar contenido local,
        y micrófono para grabar audio. Tus datos están protegidos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F6F6', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginLeft: 10 },
  help: { fontSize: 14, marginTop: 20, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 }
});
