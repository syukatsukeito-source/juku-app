import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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

type Filter = 'all' | 'today' | 'active';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatMonthYear(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function createCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days: (string | null)[] = [];
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }
  for (let day = 1; day <= totalDays; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push(date);
  }
  return days;
}

export default function SchedulesScreen() {
  const { session } = useAuth();
  const { students } = useStudents();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const fetchSchedules = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from<Schedule>('schedules')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.warn('Schedules fetch error:', error.message);
      setSchedules([]);
    } else {
      setSchedules(data ?? []);
    }
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [fetchSchedules])
  );

  const today = new Date().toISOString().slice(0, 10);
  const calendarDays = useMemo(() => createCalendarDays(currentMonth), [currentMonth]);
  const monthLabel = formatMonthYear(currentMonth);

  const filteredSchedules = useMemo(
    () =>
      schedules.filter((item) => {
        if (filter === 'today') {
          return item.date === today;
        }
        if (filter === 'active') {
          return item.status !== '完了';
        }
        return true;
      }),
    [filter, schedules, today]
  );

  const getStudentName = (studentId: string | null) => {
    return students.find((student) => student.id === studentId)?.name ?? studentId ?? '未設定';
  };

  const schedulesByDate = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    for (const schedule of schedules) {
      map[schedule.date] = [...(map[schedule.date] ?? []), schedule];
    }
    return map;
  }, [schedules]);

  const toShortTime = (value: string | null) => (value ? value.slice(0, 5) : '--:--');

  const dayPreviewText = (date: string) => {
    const daySchedules = schedulesByDate[date] ?? [];
    if (daySchedules.length === 0) return null;
    const first = daySchedules[0];
    const timeRange = `${toShortTime(first.start_time)}-${toShortTime(first.end_time)}`;
    const studentName = getStudentName(first.student_id);
    const title = first.title ?? '';
    return `${timeRange} ${studentName} ${title}`;
  };

  const scheduleCountForDate = (date: string) => schedules.filter((item) => item.date === date).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>予約一覧</Text>
        <Link href="/schedules/new" style={styles.addButton}>
          <Text style={styles.addButtonText}>新規</Text>
        </Link>
      </View>

      <View style={styles.calendarHeader}>
        <Pressable
          style={styles.monthNavButton}
          onPress={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        >
          <Text style={styles.monthNavText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable
          style={styles.monthNavButton}
          onPress={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
        >
          <Text style={styles.monthNavText}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <Pressable
            key={`${day ?? 'empty'}-${index}`}
            style={[styles.dayCell, !day ? styles.emptyDayCell : null]}
            onPress={() => day && router.push({ pathname: '/schedules/select-subject', params: { date: day } })}
            disabled={!day}
          >
            {day ? (
              <>
                <Text style={styles.dayNumber}>{Number(day.split('-')[2])}</Text>
                {dayPreviewText(day) ? (
                  <Text style={styles.dayPreview} numberOfLines={1}>
                    {dayPreviewText(day)}
                  </Text>
                ) : null}
                {scheduleCountForDate(day) > 1 ? (
                  <Text style={styles.moreText}>+{scheduleCountForDate(day) - 1}</Text>
                ) : null}
              </>
            ) : null}
          </Pressable>
        ))}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'today', 'active'] as Filter[]).map((value) => (
          <Pressable
            key={value}
            style={[styles.filterButton, filter === value ? styles.filterActive : null]}
            onPress={() => setFilter(value)}
          >
            <Text style={[styles.filterText, filter === value ? styles.filterTextActive : null]}>
              {value === 'all' ? '全て' : value === 'today' ? '今日' : '未完了'}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : filteredSchedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>条件に該当する予約はありません。</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSchedules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: '/schedules/[id]', params: { id: item.id } })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardStatus}>{item.status}</Text>
              </View>
              <Text style={styles.cardMeta}>日付: {item.date}</Text>
              <Text style={styles.cardMeta}>
                時間: {item.start_time ?? '未設定'} ～ {item.end_time ?? '未設定'}
              </Text>
              <Text style={styles.cardMeta}>生徒: {getStudentName(item.student_id)}</Text>
              {item.notes ? <Text style={styles.cardNotes}>{item.notes}</Text> : null}
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  addButton: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  addButtonText: { color: '#fff', fontWeight: '700' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthNavButton: { padding: 10, borderRadius: 10, backgroundColor: '#f3f4f6' },
  monthNavText: { fontSize: 18, fontWeight: '700' },
  monthLabel: { fontSize: 18, fontWeight: '700' },
  weekdaysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  weekdayText: { width: '14.28%', textAlign: 'center', color: '#6b7280', fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  emptyDayCell: { backgroundColor: 'transparent', borderWidth: 0 },
  dayNumber: { fontSize: 14, fontWeight: '700', alignSelf: 'flex-end' },
  dayPreview: {
    marginTop: 2,
    fontSize: 9,
    color: '#374151',
    width: '100%',
  },
  moreText: { fontSize: 9, color: '#2563eb', marginTop: 1, fontWeight: '700' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb', marginTop: 4 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, marginTop: 8 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db', marginRight: 8, marginBottom: 8 },
  filterActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { color: '#111827', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 16 },
  listContent: { paddingBottom: 24 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardStatus: { color: '#2563eb', fontWeight: '700' },
  cardMeta: { color: '#374151', marginBottom: 4 },
  cardNotes: { color: '#4b5563', marginTop: 8 },
});
