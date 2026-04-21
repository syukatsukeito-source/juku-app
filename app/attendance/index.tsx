import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../context/StudentsContext';

type AttendanceStatus = '出席' | '遅刻' | '欠席';

type AttendanceRecord = {
  id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  '出席': '#2563eb',
  '遅刻': '#d97706',
  '欠席': '#dc2626',
};

export default function AttendanceScreen() {
  const { session } = useAuth();
  const { students } = useStudents();
  const today = new Date().toISOString().slice(0, 10);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchTodayAttendance = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', today);
    setRecords(data ?? []);
    setLoading(false);
  }, [session?.user?.id, today]);

  useFocusEffect(
    useCallback(() => {
      fetchTodayAttendance();
    }, [fetchTodayAttendance])
  );

  const getStatus = (studentId: string): AttendanceStatus | null =>
    (records.find((r) => r.student_id === studentId)?.status as AttendanceStatus) ?? null;

  const handleStatus = async (studentId: string, status: AttendanceStatus) => {
    if (!session?.user?.id) return;
    setSaving(studentId);
    const existing = records.find((r) => r.student_id === studentId);

    if (existing) {
      if (existing.status === status) {
        await supabase.from('attendance').delete().eq('id', existing.id);
        setRecords((prev) => prev.filter((r) => r.id !== existing.id));
      } else {
        const { data } = await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existing.id)
          .select()
          .single();
        if (data) setRecords((prev) => prev.map((r) => (r.id === existing.id ? data : r)));
      }
    } else {
      const { data } = await supabase
        .from('attendance')
        .insert({ user_id: session.user.id, student_id: studentId, date: today, status })
        .select()
        .single();
      if (data) setRecords((prev) => [...prev, data]);
    }

    setSaving(null);
  };

  const displayDate = today.replace(/-/g, '/');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{displayDate} の出欠</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const currentStatus = getStatus(item.id);
            const isSaving = saving === item.id;
            return (
              <View style={styles.card}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/students/[id]', params: { id: item.id } })
                  }
                >
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentGrade}>{item.grade}</Text>
                </Pressable>

                <View style={styles.buttonRow}>
                  {(['出席', '遅刻', '欠席'] as AttendanceStatus[]).map((status) => (
                    <Pressable
                      key={status}
                      disabled={isSaving}
                      onPress={() => handleStatus(item.id, status)}
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor:
                            currentStatus === status
                              ? STATUS_COLORS[status]
                              : '#e5e7eb',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          { color: currentStatus === status ? '#fff' : '#111827' },
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {currentStatus === '欠席' && (
                  <Pressable
                    style={styles.contactButton}
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
                  >
                    <Text style={styles.contactButtonText}>保護者に連絡</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#111827' },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  studentName: { fontSize: 18, fontWeight: '700', marginBottom: 2, color: '#1e40af' },
  studentGrade: { color: '#6b7280', marginBottom: 10 },
  buttonRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: { fontWeight: '700' },
  contactButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  contactButtonText: { color: '#fff', fontWeight: '700' },
});