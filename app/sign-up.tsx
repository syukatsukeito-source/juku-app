import { useState } from 'react';
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name) {
      Alert.alert('エラー', 'お名前を入力してください。');
      return false;
    }
    if (!email || !password) {
      Alert.alert('エラー', 'メールとパスワードを入力してください。');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const fnUrl = process.env.EXPO_PUBLIC_CREATE_USER_URL;
      if (!fnUrl) {
        Alert.alert('構成エラー', 'サインアップ用関数の URL が設定されていません。');
        return;
      }

      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });

      if (!res.ok) {
        const text = await res.text();
        Alert.alert('登録失敗', text || res.statusText);
        return;
      }

      Alert.alert('登録完了', 'ユーザー登録が完了しました。メールを確認してください。');
      router.replace('/sign-in');
    } catch (e: any) {
      Alert.alert('エラー', e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>新規登録</Text>

      <TextInput style={styles.input} placeholder="お名前" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="email@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="パスワード" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="電話番号 (任意)" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

      <Pressable style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>登録</Text>}
      </Pressable>

      <Pressable style={styles.subButton} onPress={() => router.push('/sign-in')}>
        <Text style={styles.subButtonText}>ログインに戻る</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  subButton: { marginTop: 12, alignItems: 'center' },
  subButtonText: { color: '#111827' },
});
