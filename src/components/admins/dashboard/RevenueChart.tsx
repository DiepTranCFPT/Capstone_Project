import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DashboardService from "~/services/dashboardService";
import { Spin } from "antd";

interface ChartDataPoint {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  selectedYear: string;
  selectedMonth: string;
  selectedDay: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ selectedYear, selectedMonth, selectedDay }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate months (1-12)
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  }, []);

  // Fetch chart data when filters change
  useEffect(() => {
    const fetchChartData = async () => {
      if (!selectedYear) {
        setChartData([]);
        return;
      }

      setLoading(true);
      try {
        let dataPoints: ChartDataPoint[] = [];

        if (selectedDay && selectedMonth && selectedYear) {
          // Show single day data
          const res = await DashboardService.getRevenueSystem({
            year: selectedYear,
            month: selectedMonth,
            day: selectedDay,
          });
          dataPoints = [
            {
              date: `${selectedDay}/${selectedMonth}/${selectedYear}`,
              revenue: res.data?.totalAmount || 0,
            },
          ];
        } else if (selectedMonth && selectedYear) {
          // Show all days in selected month
          const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
          const promises = Array.from({ length: daysInMonth }, async (_, i) => {
            const day = (i + 1).toString().padStart(2, "0");
            try {
              const res = await DashboardService.getRevenueSystem({
                year: selectedYear,
                month: selectedMonth,
                day,
              });
              return {
                date: day,
                revenue: res.data?.totalAmount || 0,
              };
            } catch {
              return {
                date: day,
                revenue: 0,
              };
            }
          });
          dataPoints = await Promise.all(promises);
        } else if (selectedYear) {
          // Show all months in selected year
          const promises = months.map(async (month) => {
            try {
              const res = await DashboardService.getRevenueSystem({
                year: selectedYear,
                month,
              });
              const monthName = new Date(parseInt(selectedYear), parseInt(month) - 1, 1).toLocaleString("en-US", {
                month: "short",
              });
              return {
                date: monthName,
                revenue: res.data?.totalAmount || 0,
              };
            } catch {
              const monthName = new Date(parseInt(selectedYear), parseInt(month) - 1, 1).toLocaleString("en-US", {
                month: "short",
              });
              return {
                date: monthName,
                revenue: 0,
              };
            }
          });
          dataPoints = await Promise.all(promises);
        }

        setChartData(dataPoints);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedYear, selectedMonth, selectedDay, months]);

  return (
    <>
      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spin />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
          {selectedYear ? "No data available" : "Please select a year to view chart"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: number) => {
                return new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value);
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1", r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </>
  );
};

export default RevenueChart;

