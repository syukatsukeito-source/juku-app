import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useStudents } from '../../context/StudentsContext';

export default function NewStudentScreen() {
  const { addStudent } = useStudents();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = () => {
    if (!name || !grade || !guardianName) {
      Alert.alert('入力不足', '氏名・学年・保護者名は必須です。');
      return;
    }

    addStudent({
      name,
      grade,
      guardianName,
      guardianPhone,
      emergencyContactName,
      emergencyContactPhone,
      address,
    });

    Alert.alert('登録完了', '新しい生徒を追加しました。');
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        新規生徒追加
      </Text>

      <TextInput
        placeholder="氏名"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="学年"
        value={grade}
        onChangeText={setGrade}
        style={styles.input}
      />
      <TextInput
        placeholder="保護者名"
        value={guardianName}
        onChangeText={setGuardianName}
        style={styles.input}
      />
      <TextInput
        placeholder="保護者電話番号"
        value={guardianPhone}
        onChangeText={setGuardianPhone}
        style={styles.input}
      />
      <TextInput
        placeholder="緊急連絡先名"
        value={emergencyContactName}
        onChangeText={setEmergencyContactName}
        style={styles.input}
      />
      <TextInput
        placeholder="緊急連絡先電話番号"
        value={emergencyContactPhone}
        onChangeText={setEmergencyContactPhone}
        style={styles.input}
      />
      <TextInput
        placeholder="住所"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <Pressable
        onPress={handleSubmit}
        style={{
          backgroundColor: '#2563eb',
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>登録する</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
   button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center' as const,
    marginTop: 12,
  },
};