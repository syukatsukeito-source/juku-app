import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, AttendanceStatus } from '../.expo/types/student';

type StudentsContextType = {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'status'>) => void;
  updateStatus: (studentId: string, newStatus: AttendanceStatus) => void;
};

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

const STORAGE_KEY = 'students_data';

const initialStudents: Student[] = [
  {
    id: '1',
    name: '田中 太郎',
    grade: '中学1年',
    guardianName: '田中 花子',
    guardianPhone: '090-1111-2222',
    emergencyContactName: '田中 一郎',
    emergencyContactPhone: '090-3333-4444',
    address: '東京都新宿区○○1-2-3',
    status: '出席',
  },
  {
    id: '2',
    name: '佐藤 花子',
    grade: '中学2年',
    guardianName: '佐藤 一郎',
    guardianPhone: '090-5555-6666',
    emergencyContactName: '佐藤 真理',
    emergencyContactPhone: '090-7777-8888',
    address: '東京都渋谷区○○4-5-6',
    status: '欠席',
  },
];

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          setStudents(JSON.parse(saved));
        } else {
          setStudents(initialStudents);
        }
      } catch (error) {
        console.error('生徒データの読み込み失敗:', error);
        setStudents(initialStudents);
      } finally {
        setIsLoaded(true);
      }
    };

    loadStudents();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const saveStudents = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (error) {
        console.error('生徒データの保存失敗:', error);
      }
    };

    saveStudents();
  }, [students, isLoaded]);

  const addStudent = (student: Omit<Student, 'id' | 'status'>) => {
    const newStudent: Student = {
      id: Date.now().toString(),
      status: '出席',
      ...student,
    };

    setStudents((prev) => [...prev, newStudent]);
  };

  const updateStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const value = useMemo(
    () => ({
      students,
      addStudent,
      updateStatus,
    }),
    [students]
  );

  if (!isLoaded) {
    return null;
  }

  return (
    <StudentsContext.Provider value={value}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentsContext);

  if (!context) {
    throw new Error('useStudents must be used within StudentsProvider');
  }

  return context;
}