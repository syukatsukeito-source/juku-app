import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const SUBJECTS = ['国語', '数学', '英語', '理科', '社会'];

export default function SelectSubjectScreen() {
  const params = useLocalSearchParams();
  const date = Array.isArray(params.date) ? params.date[0] : params.date;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>授業の科目を選択</Text>
      <Text style={styles.subtitle}>{date ? `${date} の予約` : '予約日を選択してください'}</Text>

      <View style={styles.buttonsContainer}>
        {SUBJECTS.map((subject) => (
          <Pressable
            key={subject}
            style={styles.subjectButton}
            onPress={() => {
              if (!date) return;
              router.push({
                pathname: '/schedules/new',
                params: { date, subject },
              });
            }}
          >
            <Text style={styles.subjectText}>{subject}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>キャンセル</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6b7280', marginBottom: 24 },
  buttonsContainer: { gap: 12 },
  subjectButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subjectText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelButton: { alignItems: 'center', marginTop: 24 },
  cancelText: { color: '#374151', fontWeight: '700' },
});
