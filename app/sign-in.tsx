import { useState } from 'react';
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    setError(null);
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return false;
    }
    if (!name) {
      setError('お名前を入力してください。');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('有効なメールアドレスを入力してください。');
      return false;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください。');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('ログイン失敗', error.message);
        return;
      }
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('登録失敗', error.message);
        return;
      }
      // If Supabase returned a session/user immediately, we can upsert profile now.
      const userId = data?.user?.id ?? data?.session?.user?.id;
      if (userId) {
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: userId,
          full_name: name,
          phone,
        });
        if (upsertError) {
          console.warn('profile upsert failed', upsertError.message);
        }
        router.replace('/');
        return;
      }

      // If no session (email confirm flow), inform the user. A DB trigger will create a minimal profile,
      // but any extra info (name/phone) cannot be upserted without an authenticated session or server-side service key.
      Alert.alert('確認メール', '確認メールを送信しました。メール確認後にログインしてください。');
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ログイン</Text>

      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="お名前"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="パスワード"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="電話番号 (任意)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, loading || !email || !password ? styles.buttonDisabled : null]}
        onPress={handleSignIn}
        disabled={loading || !email || !password}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ログイン</Text>}
      </Pressable>

      <Pressable
        style={[styles.subButton, loading || !email || !password ? styles.subButtonDisabled : null]}
        onPress={handleSignUp}
        disabled={loading || !email || !password}
      >
        <Text style={styles.subButtonText}>新規登録</Text>
      </Pressable>
      <Pressable style={[styles.subButton, { marginTop: 8 }]} onPress={() => router.push('/sign-up')}>
        <Text style={styles.subButtonText}>別の登録フォームへ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  subButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  subButtonText: {
    color: '#111827',
    fontWeight: '700',
  },
  error: {
    color: '#dc2626',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  subButtonDisabled: {
    opacity: 0.6,
  },
});