import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStudents } from '../../context/StudentsContext';

export default function StudentDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { students } = useStudents();
  const student = students.find((item) => item.id === id);

  if (!student) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text>該当する生徒が見つかりません。</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        生徒詳細
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 10,
          padding: 16,
          gap: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>氏名: {student.name}</Text>
        <Text>学年: {student.grade}</Text>
        <Text>保護者名: {student.guardianName}</Text>
        <Text>保護者電話番号: {student.guardianPhone}</Text>
        <Text>緊急連絡先: {student.emergencyContactName}</Text>
        <Text>緊急連絡先電話番号: {student.emergencyContactPhone}</Text>
        <Text>住所: {student.address}</Text>
        <Text>出欠状態: {student.status}</Text>
      </View>
    </ScrollView>
  );
}