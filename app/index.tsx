import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <ImageBackground
      source={require('../assets/images/student.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>学習塾向け 管理アプリ</Text>
          <Text style={styles.title}>○○塾 itimane</Text>
          <Text style={styles.description}>
            出欠・生徒情報・保護者連絡をまとめて管理
          </Text>
        </View>

        <View style={styles.buttonArea}>
          <Pressable style={styles.button} onPress={() => router.push('/attendance')}>
            <Text style={styles.buttonText}>出欠管理</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => router.push('/students')}>
            <Text style={styles.buttonText}>生徒一覧</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => router.push('/messages')}>
            <Text style={styles.buttonText}>保護者連絡</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: 'rgba(220,38,38,0.9)' }]}
            onPress={signOut}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>ログアウト</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: { marginTop: 20 },
  subtitle: { color: '#f3f4f6', fontSize: 14, marginBottom: 8 },
  title: { color: '#ffffff', fontSize: 34, fontWeight: 'bold', marginBottom: 12 },
  description: { color: '#f9fafb', fontSize: 16, lineHeight: 24 },
  buttonArea: { gap: 14 },
  button: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});