import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

export default function MessagesScreen() {
  const params = useLocalSearchParams<{
    studentName?: string | string[];
    guardianName?: string | string[];
    guardianPhone?: string | string[];
  }>();

  const studentName = Array.isArray(params.studentName)
    ? params.studentName[0]
    : params.studentName;

  const guardianName = Array.isArray(params.guardianName)
    ? params.guardianName[0]
    : params.guardianName;

  const guardianPhone = Array.isArray(params.guardianPhone)
    ? params.guardianPhone[0]
    : params.guardianPhone;

  const initialMessage = useMemo(() => {
    return `${studentName ?? ''}さんが本日欠席となりました。ご確認をお願いいたします。`;
  }, [studentName]);

  const [message, setMessage] = useState(initialMessage);

  const handleSend = () => {
    Alert.alert(
      '送信完了',
      `${guardianName ?? '保護者'} へ連絡を送信しました。`
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        保護者へ連絡
      </Text>

      <Text style={{ marginBottom: 8 }}>生徒名: {studentName ?? '-'}</Text>
      <Text style={{ marginBottom: 8 }}>保護者名: {guardianName ?? '-'}</Text>
      <Text style={{ marginBottom: 16 }}>電話番号: {guardianPhone ?? '-'}</Text>

      <Text style={{ marginBottom: 8 }}>連絡内容</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          minHeight: 140,
          textAlignVertical: 'top',
          marginBottom: 16,
        }}
      />

      <Pressable
        onPress={handleSend}
        style={{
          backgroundColor: '#2563eb',
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>送信</Text>
      </Pressable>
    </View>
  );
}