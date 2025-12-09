import { useEffect, useState } from "react";
import StudentDashboardService from "~/services/StudentDashboardService";
import type { StudentExamStatistics, StudentExamStatisticsResponse, StudentFinancialStatistics, StudentFinancialStatisticsResponse, StudentOverallStatistics, StudentOverallStatisticsResponse } from "~/types/studentDashboard";


export default function useStudentDashboardStatistics() {
  const [overall, setOverall] = useState<StudentOverallStatistics | null>(null);
  const [financial, setFinancial] = useState<StudentFinancialStatistics | null>(null);
  const [exam, setExam] = useState<StudentExamStatistics | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  const fetchStudentStatistics = async () => {
    try {
      setLoading(true);

      const [
        overallRes,
        financialRes,
        examRes
      ]: [
        StudentOverallStatisticsResponse,
        StudentFinancialStatisticsResponse,
        StudentExamStatisticsResponse
      ] = await Promise.all([
        StudentDashboardService.getOverall(),
        StudentDashboardService.getFinancial(),
        StudentDashboardService.getExam()
      ]);

      setOverall(overallRes.data ?? null);
      setFinancial(financialRes.data ?? null);
      setExam(examRes.data ?? null);

    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentStatistics();
  }, []);

  return {
    overall,
    financial,
    exam,
    loading,
    error,
    refetch: fetchStudentStatistics,
  };
}
