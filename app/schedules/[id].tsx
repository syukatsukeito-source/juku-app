import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../context/StudentsContext';

type Schedule = {
  id: string;
  title: string;
  student_id: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  notes: string | null;
};

export default function ScheduleDetailScreen() {
  const params = useLocalSearchParams();
  const scheduleId = params.id as string;
  const { session } = useAuth();
  const { students } = useStudents();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [title, setTitle] = useState('');
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('予約済み');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !scheduleId) return;

    const fetchSchedule = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<Schedule>('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (error) {
        console.warn('Schedule fetch error:', error.message);
        Alert.alert('読み込み失敗', '予約データを読み込めませんでした。');
        router.replace('/schedules');
        return;
      }

      setSchedule(data);
      if (data) {
        setTitle(data.title);
        setStudentId(data.student_id ?? '');
        setDate(data.date);
        setStartTime(data.start_time ?? '');
        setEndTime(data.end_time ?? '');
        setStatus(data.status);
        setNotes(data.notes ?? '');
      }
      setLoading(false);
    };

    fetchSchedule();
  }, [session, scheduleId]);

  const selectedStudentName = students.find((student) => student.id === studentId)?.name;

  const handleUpdate = async () => {
    if (!title || !date) {
      Alert.alert('入力エラー', 'タイトルと日付は必須です。');
      return;
    }
    if (!session?.user?.id) {
      Alert.alert('認証エラー', 'ログイン状態が必要です。');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('schedules')
      .update({
        title,
        student_id: studentId || null,
        date,
        start_time: startTime || null,
        end_time: endTime || null,
        status,
        notes: notes || null,
      })
      .eq('id', scheduleId);
    setLoading(false);

    if (error) {
      Alert.alert('更新失敗', error.message);
      return;
    }

    Alert.alert('更新完了', '予約を更新しました。');
    router.replace('/schedules');
  };

  const handleDelete = async () => {
    Alert.alert('削除確認', 'この予約を削除しますか？', [
      { text: 'いいえ', style: 'cancel' },
      {
        text: 'はい',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase.from('schedules').delete().eq('id', scheduleId);
          setLoading(false);
          if (error) {
            Alert.alert('削除失敗', error.message);
            return;
          }
          Alert.alert('削除完了', '予約を削除しました。');
          router.replace('/schedules');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>予約編集</Text>

      <TextInput style={styles.input} placeholder="タイトル" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>生徒選択</Text>
      <TextInput
        style={styles.input}
        placeholder="生徒ID か 生徒名を入力"
        value={selectedStudentName ?? studentId}
        editable={false}
      />
      <View style={styles.selectList}>
        {students.map((student) => (
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

      <TextInput style={styles.input} placeholder="日付（YYYY-MM-DD）" value={date} onChangeText={setDate} />
      <TextInput style={styles.input} placeholder="開始時間（HH:MM）" value={startTime} onChangeText={setStartTime} />
      <TextInput style={styles.input} placeholder="終了時間（HH:MM）" value={endTime} onChangeText={setEndTime} />
      <TextInput style={styles.input} placeholder="ステータス" value={status} onChangeText={setStatus} />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="メモ"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      <Pressable style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? '更新中...' : '保存する'}</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.deleteButton]} onPress={handleDelete} disabled={loading}>
        <Text style={styles.buttonText}>削除する</Text>
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
  label: { marginBottom: 8, color: '#374151', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  selectList: { marginBottom: 12 },
  selectItem: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  selectItemSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  selectText: { color: '#111827' },
  selectTextSelected: { color: '#fff' },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButton: { backgroundColor: '#dc2626' },
  buttonText: { color: '#fff', fontWeight: '700' },
  cancelButton: { alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#374151', fontWeight: '700' },
});
