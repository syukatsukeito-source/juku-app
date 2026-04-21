import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../context/StudentsContext';

type AttendanceRecord = {
  id: string;
  student_id: string;
  date: string;
  status: '出席' | '遅刻' | '欠席';
};

const STATUS_COLORS: Record<string, string> = {
  '出席': '#2563eb',
  '遅刻': '#d97706',
  '欠席': '#dc2626',
};

export default function StudentAttendanceScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { session } = useAuth();
  const { students } = useStudents();
  const student = students.find((s) => s.id === id);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchAttendance = useCallback(async () => {
    if (!session?.user?.id || !id) return;
    setLoading(true);
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('student_id', id)
      .order('date', { ascending: false });
    setRecords(data ?? []);
    setLoading(false);
  }, [session?.user?.id, id]);

  useFocusEffect(
    useCallback(() => {
      fetchAttendance();
    }, [fetchAttendance])
  );

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#6b7280' }}>該当する生徒が見つかりません。</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 生徒名ヘッダー（タップで詳細モーダル） */}
      <Pressable onPress={() => setModalVisible(true)} style={styles.nameHeader}>
        <View>
          <Text style={styles.studentNameButton}>{student.name}</Text>
          <Text style={styles.tapHint}>{student.grade} ・ タップで詳細情報</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>出欠履歴</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>出欠記録がまだありません。</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.dateText}>
                {item.date.replace(/-/g, '/')} ({getWeekday(item.date)})
              </Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* 生徒詳細モーダル */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{student.name}</Text>
            <View style={styles.detailRows}>
              <DetailRow label="学年" value={student.grade} />
              <DetailRow label="保護者名" value={student.guardianName} />
              <DetailRow label="保護者電話" value={student.guardianPhone} />
              <DetailRow label="緊急連絡先" value={student.emergencyContactName} />
              <DetailRow label="緊急連絡先電話" value={student.emergencyContactPhone} />
              <DetailRow label="住所" value={student.address} />
            </View>
            <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>閉じる</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value ?? '未設定'}</Text>
    </View>
  );
}

function getWeekday(dateStr: string) {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[new Date(dateStr).getDay()];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  studentNameButton: { fontSize: 22, fontWeight: '700', color: '#1e40af' },
  tapHint: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  chevron: { fontSize: 28, color: '#2563eb', fontWeight: '300' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: '#374151' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  dateText: { fontSize: 16, color: '#111827', fontWeight: '600' },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#111827' },
  detailRows: { gap: 14, marginBottom: 28 },
  detailRow: { flexDirection: 'row', gap: 8 },
  detailLabel: { width: 120, color: '#6b7280', fontWeight: '600' },
  detailValue: { flex: 1, color: '#111827' },
  closeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});