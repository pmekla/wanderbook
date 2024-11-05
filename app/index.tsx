import { Text, View, StyleSheet } from 'react-native';
import Navbar from '../components/navigation/NavBar';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>wanderbook</Text>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
});