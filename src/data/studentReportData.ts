
export const studentReportData = {
  studentInfo: {
    id: '1',
    name: 'John Doe',
    grade: '10th Grade',
    parentName: 'Jane Doe',
  },
  overallPerformance: {
    averageScore: 88.5,
    testsTaken: 15,
    quizzesTaken: 25,
    assignmentsCompleted: 30,
    hoursStudied: 120,
  },
  testResults: [
    {
      id: 't1',
      testName: 'Algebra Midterm',
      score: 85,
      date: '2023-10-15',
      detailedReportLink: '/parent/student/1/test/t1',
    },
    {
      id: 't2',
      testName: 'Geometry Final',
      score: 92,
      date: '2023-12-01',
      detailedReportLink: '/parent/student/1/test/t2',
    },
    {
      id: 't3',
      testName: 'Physics Quiz 1',
      score: 78,
      date: '2024-01-20',
      detailedReportLink: '/parent/student/1/test/t3',
    },
    {
      id: 't4',
      testName: 'Chemistry Lab Report',
      score: 95,
      date: '2024-02-10',
      detailedReportLink: '/parent/student/1/test/t4',
    },
  ],
  progressOverTime: [
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 78 },
    { month: 'Mar', score: 82 },
    { month: 'Apr', score: 85 },
    { month: 'May', score: 88 },
    { month: 'Jun', score: 90 },
  ],
};
