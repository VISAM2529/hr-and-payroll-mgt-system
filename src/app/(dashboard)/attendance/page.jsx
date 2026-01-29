"use client";

import { useState, useEffect, useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    isSameMonth,
    subMonths,
    addMonths,
    subYears,
    addYears,
    startOfYear,
    endOfYear,
    isSameYear,
    eachMonthOfInterval,
    isToday
} from "date-fns";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    AlertCircle,
    Briefcase,
    Coffee,
    Sun,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    List as ListIcon,
    PieChart,
    ChevronDown,
    ChevronUp,
    Timer
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function MyAttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'yearly'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await fetch("/api/employee/attendance");
            const data = await response.json();

            if (data.success) {
                setAttendance(data.data);
            } else {
                setError(data.error || "Failed to fetch attendance");
            }
        } catch (err) {
            setError("An error occurred while fetching attendance");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Highlighting Today's Attendance ---
    const todayRecord = useMemo(() => {
        return attendance.find(record => isToday(new Date(record.date)));
    }, [attendance]);

    // --- Filtering Logic ---
    const filteredAttendance = useMemo(() => {
        if (viewMode === 'monthly') {
            return attendance.filter(record =>
                isSameMonth(new Date(record.date), currentDate)
            );
        } else {
            return attendance.filter(record =>
                isSameYear(new Date(record.date), currentDate)
            );
        }
    }, [attendance, currentDate, viewMode]);

    // --- Statistics Logic ---
    const stats = useMemo(() => {
        const initialStats = {
            present: 0,
            absent: 0,
            halfDay: 0,
            leave: 0,
            holiday: 0,
            weekend: 0,
            totalWorkHours: 0
        };

        return filteredAttendance.reduce((acc, record) => {
            const status = record.status?.toLowerCase();
            if (status === 'present') acc.present++;
            else if (status === 'absent') acc.absent++;
            else if (status === 'half-day') acc.halfDay++;
            else if (status === 'leave') acc.leave++;
            else if (status === 'holiday') acc.holiday++;
            else if (status === 'weekend') acc.weekend++;

            if (record.workedHours) {
                acc.totalWorkHours += record.workedHours;
            }

            return acc;
        }, initialStats);
    }, [filteredAttendance]);

    // --- Chart Data Preparation ---
    const barChartData = useMemo(() => {
        if (viewMode === 'monthly') {
            const daysInMonth = Array.from({ length: endOfMonth(currentDate).getDate() }, (_, i) => i + 1);

            const hoursPerDay = daysInMonth.map(day => {
                const record = filteredAttendance.find(r =>
                    new Date(r.date).getDate() === day && isSameMonth(new Date(r.date), currentDate)
                );
                return record ? record.workedHours || 0 : 0;
            });

            return {
                labels: daysInMonth.map(d => d.toString()),
                datasets: [
                    {
                        label: 'Worked Hours',
                        data: hoursPerDay,
                        backgroundColor: 'rgba(99, 102, 241, 0.6)',
                        borderColor: 'rgb(79, 70, 229)',
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            };
        } else {
            const months = eachMonthOfInterval({
                start: startOfYear(currentDate),
                end: endOfYear(currentDate)
            });

            const presentPerMonth = months.map(month => filteredAttendance.filter(r => isSameMonth(new Date(r.date), month) && r.status?.toLowerCase() === 'present').length);
            const absentPerMonth = months.map(month => filteredAttendance.filter(r => isSameMonth(new Date(r.date), month) && r.status?.toLowerCase() === 'absent').length);
            const leavesPerMonth = months.map(month => filteredAttendance.filter(r => isSameMonth(new Date(r.date), month) && r.status?.toLowerCase() === 'leave').length);

            return {
                labels: months.map(m => format(m, 'MMM')),
                datasets: [
                    { label: 'Present', data: presentPerMonth, backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: 'rgb(22, 163, 74)', borderWidth: 1, borderRadius: 4 },
                    { label: 'Absent', data: absentPerMonth, backgroundColor: 'rgba(239, 68, 68, 0.6)', borderColor: 'rgb(220, 38, 38)', borderWidth: 1, borderRadius: 4 },
                    { label: 'Leaves', data: leavesPerMonth, backgroundColor: 'rgba(245, 158, 11, 0.6)', borderColor: 'rgb(217, 119, 6)', borderWidth: 1, borderRadius: 4 }
                ]
            };
        }
    }, [filteredAttendance, currentDate, viewMode]);

    const pieChartData = useMemo(() => {
        const total = stats.present + stats.absent + stats.leave + stats.halfDay;
        // Avoid partial charts if no data
        if (total === 0) return { labels: [], datasets: [] };

        return {
            labels: ['Present', 'Absent', 'Leave', 'Half Day'],
            datasets: [
                {
                    data: [stats.present, stats.absent, stats.leave, stats.halfDay],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)', // Green
                        'rgba(239, 68, 68, 0.8)', // Red
                        'rgba(245, 158, 11, 0.8)', // Amber
                        'rgba(59, 130, 246, 0.8)', // Blue
                    ],
                    borderColor: [
                        'rgb(22, 163, 74)',
                        'rgb(220, 38, 38)',
                        'rgb(217, 119, 6)',
                        'rgb(37, 99, 235)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [stats]);


    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: viewMode === 'monthly' ? 'Hours' : 'Days'
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right', // Legend on the right for pie
            },
        },
    };

    // --- Navigation Handlers ---
    const handlePrevious = () => {
        if (viewMode === 'monthly') {
            setCurrentDate(prev => subMonths(prev, 1));
        } else {
            setCurrentDate(prev => subYears(prev, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'monthly') {
            setCurrentDate(prev => addMonths(prev, 1));
        } else {
            setCurrentDate(prev => addYears(prev, 1));
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "present": return "bg-green-100 text-green-700 border-green-200";
            case "absent": return "bg-red-100 text-red-700 border-red-200";
            case "leave": return "bg-amber-100 text-amber-700 border-amber-200";
            case "half-day": return "bg-blue-100 text-blue-700 border-blue-200";
            case "holiday": return "bg-purple-100 text-purple-700 border-purple-200";
            case "weekend": return "bg-gray-100 text-gray-700 border-gray-200";
            default: return "bg-gray-50 text-gray-600 border-gray-200";
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "-";
        return format(new Date(dateString), "h:mm a");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Attendance
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {viewMode === 'monthly' ? 'Daily tracking & work hours' : 'Annual overview & trends'}
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'monthly'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setViewMode('yearly')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'yearly'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Yearly
                        </button>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2"></div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-base font-semibold text-gray-900 min-w-[140px] text-center">
                            {viewMode === 'monthly'
                                ? format(currentDate, "MMMM yyyy")
                                : format(currentDate, "yyyy")
                            }
                        </span>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Today's Highlight & Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Status Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-indigo-100 font-medium mb-1">Today ({format(new Date(), 'MMM d')})</p>
                            <h2 className="text-3xl font-bold">
                                {todayRecord ? todayRecord.status : "Not Checked In"}
                            </h2>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Timer className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <p className="text-xs text-indigo-100 mb-1 uppercase tracking-wider">Check In</p>
                            <p className="font-semibold text-lg">{todayRecord ? formatTime(todayRecord.checkIn) : "--:--"}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                            <p className="text-xs text-indigo-100 mb-1 uppercase tracking-wider">Hrs So Far</p>
                            <p className="font-semibold text-lg">{todayRecord?.workedHours ? todayRecord.workedHours.toFixed(1) + 'h' : "--"}</p>
                        </div>
                    </div>
                </div>

                {/* Pie Chart Card */}
                <div className="bg-white border border-gray-100 shadow-lg shadow-gray-100/50 rounded-2xl p-6 flex flex-col items-center justify-center">
                    <h3 className="text-gray-500 text-sm font-medium mb-4 w-full text-left flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> Attendance Distribution
                    </h3>
                    <div className="w-full h-[180px] flex items-center justify-center">
                        {pieChartData.datasets.length > 0 ? (
                            <Pie data={pieChartData} options={pieOptions} />
                        ) : (
                            <div className="text-gray-400 text-sm">No data for this period</div>
                        )}
                    </div>
                </div>

                {/* Summary Stats (Compact) */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard title="Present" value={stats.present} icon={CheckCircle2} color="text-green-600" bg="bg-green-50" borderColor="border-green-100" />
                    <StatCard title="Absent" value={stats.absent} icon={XCircle} color="text-red-600" bg="bg-red-50" borderColor="border-red-100" />
                    <StatCard title="Leaves" value={stats.leave} icon={Briefcase} color="text-amber-600" bg="bg-amber-50" borderColor="border-amber-100" />
                    <StatCard title="Holidays" value={stats.holiday} icon={Sun} color="text-purple-600" bg="bg-purple-50" borderColor="border-purple-100" />
                </div>
            </div>

            {/* Main Charts */}
            <div className="bg-white border border-gray-100 shadow-lg shadow-gray-100/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        {viewMode === 'monthly' ? 'Work Hours Overview' : 'Attendance Trends'}
                    </h2>
                </div>
                <div className="h-[300px] w-full">
                    <Bar options={{ ...chartOptions, maintainAspectRatio: false }} data={barChartData} />
                </div>
            </div>

            {/* Collapsible Data Table */}
            <div className="bg-white border border-gray-100 shadow-lg shadow-gray-100/50 rounded-2xl overflow-hidden">
                <div
                    className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                >
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <ListIcon className="w-5 h-5 text-indigo-500" />
                            Detailed History
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                            {filteredAttendance.length} records
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {viewMode === 'monthly' && (
                            <div className="text-sm text-gray-500 hidden sm:block">
                                Total Hours: <span className="font-medium text-indigo-600">{stats.totalWorkHours.toFixed(1)} hrs</span>
                            </div>
                        )}
                        {isHistoryOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>

                {isHistoryOpen && (
                    <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAttendance.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Calendar className="w-10 h-10 text-gray-300" />
                                                <p>No attendance records found for this period</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendance.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50/80 transition-colors duration-200 group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{format(new Date(record.date), "MMM d, yyyy")}</p>
                                                        <p className="text-xs text-gray-500">{format(new Date(record.date), "EEEE")}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{formatTime(record.checkIn)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{formatTime(record.checkOut)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {record.workedHours ? `${record.workedHours.toFixed(1)} hrs` : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {record.dayType === 'Half' ? 'Half Day' : 'Full Day'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {error && (
                <div className="fixed bottom-6 right-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg, borderColor }) {
    return (
        <div className={`p-4 rounded-xl border ${borderColor} ${bg} flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95 duration-200`}>
            <div className={`p-2 rounded-full bg-white shadow-sm ${color} mb-1`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="text-center">
                <span className="block text-xl font-bold text-gray-900">{value}</span>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{title}</span>
            </div>
        </div>
    );
}
