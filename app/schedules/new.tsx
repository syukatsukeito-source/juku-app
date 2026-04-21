import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../context/StudentsContext';

const SUBJECTS = ['国語', '数学', '英語', '理科', '社会'];

export default function NewScheduleScreen() {
  const params = useLocalSearchParams();
  const { session } = useAuth();
  const { students } = useStudents();
  const [subject, setSubject] = useState('');
  const [lessonDetail, setLessonDetail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        student.name.includes(studentQuery) || student.id.includes(studentQuery)
      ),
    [students, studentQuery]
  );

  const selectedStudentName = students.find((student) => student.id === studentId)?.name;

  useEffect(() => {
    const dateParam = params.date;
    const subjectParam = params.subject;
    if (dateParam && typeof dateParam === 'string') {
      setDate(dateParam);
    }
    if (subjectParam && typeof subjectParam === 'string') {
      setSubject(subjectParam);
    }
  }, [params.date, params.subject]);

  const handleSave = async () => {
    if (!subject || !lessonDetail || !date) {
      Alert.alert('入力エラー', '科目・授業内容・日付は必須です。');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('認証エラー', 'ログイン状態が必要です。');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('schedules').insert([
      {
        user_id: session.user.id,
        student_id: studentId || null,
        title: `${subject} - ${lessonDetail}`,
        date,
        start_time: startTime || null,
        end_time: endTime || null,
        status: '予約済み',
        notes: notes || null,
      },
    ]);

    setLoading(false);

    if (error) {
      Alert.alert('保存失敗', error.message);
      return;
    }

    router.replace('/schedules');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>予約を作成</Text>

      <Text style={styles.label}>科目</Text>
      <View style={styles.subjectDisplay}>
        <Text style={styles.subjectText}>{subject || '未選択'}</Text>
      </View>

      <View style={styles.subjectButtonsWrap}>
        {SUBJECTS.map((item) => (
          <Pressable
            key={item}
            style={[styles.subjectButton, subject === item ? styles.subjectButtonActive : null]}
            onPress={() => setSubject(item)}
          >
            <Text style={[styles.subjectButtonText, subject === item ? styles.subjectButtonTextActive : null]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="授業内容（例: 漢字テスト対策）"
        value={lessonDetail}
        onChangeText={setLessonDetail}
      />

      <Text style={styles.label}>生徒を選択</Text>
      <TextInput
        style={styles.input}
        placeholder="生徒名またはIDで検索"
        value={studentQuery}
        onChangeText={setStudentQuery}
      />
      <View style={styles.selectList}>
        {filteredStudents.map((student) => (
          <Pressable
            key={student.id}
            style={[
              styles.selectItem,
              studentId === student.id ? styles.selectItemSelected : null,
            ]}
            onPress={() => setStudentId(student.id)}
          >
            <Text style={[styles.selectText, studentId === student.id ? styles.selectTextSelected : null]}>
              {student.name} ({student.grade})
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.selectedStudentText}>
        選択中: {selectedStudentName ?? 'なし'}
      </Text>

      <Text style={styles.label}>日付</Text>
      <TextInput
        style={styles.input}
        placeholder="日付（YYYY-MM-DD）"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={styles.input}
        placeholder="開始時間（HH:MM）"
        value={startTime}
        onChangeText={setStartTime}
      />

      <TextInput
        style={styles.input}
        placeholder="終了時間（HH:MM）"
        value={endTime}
        onChangeText={setEndTime}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="メモ（任意）"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      <Pressable style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '保存中...' : '保存する'}</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
        <Text style={styles.cancelText}>戻る</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  label: { marginBottom: 8, fontWeight: '700', color: '#374151' },
  selectList: { marginBottom: 12 },
  selectItem: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  selectItemSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  selectText: { color: '#111827' },
  selectTextSelected: { color: '#fff' },
  selectedStudentText: { marginBottom: 12, color: '#374151' },
  subjectDisplay: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  subjectText: { color: '#111827', fontWeight: '700' },
  subjectButtonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  subjectButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  subjectButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  subjectButtonText: { color: '#111827', fontWeight: '700' },
  subjectButtonTextActive: { color: '#fff' },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  cancelButton: { alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#374151', fontWeight: '700' },
});
