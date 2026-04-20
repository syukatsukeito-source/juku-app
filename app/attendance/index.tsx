import { View, Text, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useStudents } from '../../context/StudentsContext';

export default function AttendanceScreen() {
  const { students, updateStatus } = useStudents();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        本日の出欠
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/students/[id]',
                  params: { id: item.id },
                })
              }
            >
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 6 }}>
                {item.name}
              </Text>
            </Pressable>

            <Text style={{ marginBottom: 4 }}>学年: {item.grade}</Text>
            <Text style={{ marginBottom: 12 }}>現在の状態: {item.status}</Text>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Pressable
                onPress={() => updateStatus(item.id, '出席')}
                style={{
                  backgroundColor: item.status === '出席' ? '#2563eb' : '#e5e7eb',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: item.status === '出席' ? '#fff' : '#111827' }}>
                  出席
                </Text>
              </Pressable>

              <Pressable
                onPress={() => updateStatus(item.id, '欠席')}
                style={{
                  backgroundColor: item.status === '欠席' ? '#dc2626' : '#e5e7eb',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: item.status === '欠席' ? '#fff' : '#111827' }}>
                  欠席
                </Text>
              </Pressable>

              <Pressable
                onPress={() => updateStatus(item.id, '遅刻')}
                style={{
                  backgroundColor: item.status === '遅刻' ? '#d97706' : '#e5e7eb',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: item.status === '遅刻' ? '#fff' : '#111827' }}>
                  遅刻
                </Text>
              </Pressable>
            </View>

            {item.status === '欠席' && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/messages',
                    params: {
                      studentId: item.id,
                      studentName: item.name,
                      guardianName: item.guardianName,
                      guardianPhone: item.guardianPhone,
                    },
                  })
                }
                style={{
                  backgroundColor: '#059669',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  保護者に連絡
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}