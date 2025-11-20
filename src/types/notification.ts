export interface Notification {
  id: string;
  studentId: string;
  studentName: string;
  type: 'exam_deadline' | 'low_score' | 'performance_alert' | 'new_assignment' | 'system_message';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string; // ISO date string
  deadline?: string; // ISO date string - for exam deadlines
  score?: number; // for score warnings
  examId?: string; // reference to exam if applicable
  actionUrl?: string; // optional link to take action
}

export interface NotificationFilter {
  type?: string;
  priority?: string;
  isRead?: boolean;
  studentId?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
}
