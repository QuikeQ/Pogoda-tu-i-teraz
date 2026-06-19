import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button, ScrollView } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Brak zgody na lokalizację');
      setLoading(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&current=temperature_2m,wind_speed_10m,precipitation&hourly=temperature_2m&forecast_days=1`
      );
      const data = await response.json();
      setWeather(data);
    } catch (e) {
      setError('Błąd pobierania danych');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text>{error}</Text><Button title="Ponów" onPress={fetchWeather}/></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {weather && (
        <>
          <Text style={styles.title}>Pogoda tu i teraz</Text>
          <Text>Temperatura: {weather.current.temperature_2m}°C</Text>
          <Text>Wiatr: {weather.current.wind_speed_10m} km/h</Text>
          <Button title="Odśwież" onPress={fetchWeather} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});