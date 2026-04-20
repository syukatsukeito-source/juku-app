import { View, Text, FlatList, Pressable } from 'react-native';
import { router, Stack } from 'expo-router';
import { useStudents } from '../../context/StudentsContext';

export default function StudentsScreen() {
  const { students } = useStudents();

  return (
    <>
      <Stack.Screen
        options={{
          title: '生徒一覧',
          headerRight: () => (
            <Pressable onPress={() => router.push('/students/new')}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2563eb' }}>
                ＋
              </Text>
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        <Text style={{ fontSize: 18, marginBottom: 16 }}>
          登録生徒数: {students.length}名
        </Text>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/students/[id]',
                  params: { id: item.id },
                })
              }
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
                {item.name}
              </Text>
              <Text>学年: {item.grade}</Text>
              <Text>保護者: {item.guardianName}</Text>
            </Pressable>
          )}
        />
      </View>
    </>
  );
}