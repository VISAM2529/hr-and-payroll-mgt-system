"use client";

import { useState, useEffect, useMemo } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    isSameMonth,
    subMonths,
    addMonths,
    isToday,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    startOfYear,
    endOfYear,
    eachMonthOfInterval,
    isSameYear
} from "date-fns";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    AlertCircle,
    Briefcase,
    Sun,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    List as ListIcon,
    PieChart,
    Timer,
    Flame,
    Zap,
    Target,
    LayoutDashboard,
    Search,
    Filter,
    ArrowUpRight,
    Play,
    Square
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { toast } from "react-hot-toast";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const TabButton = ({ active, label, icon: Icon, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all duration-300 border-b-2 ${active
            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
        {label}
    </button>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
        {children}
    </div>
);

export default function MyAttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('monthly');
    const [isPunchedIn, setIsPunchedIn] = useState(false);
    const [elapsedTime, setElapsedTime] = useState("00:00:00");

    useEffect(() => {
        fetchAttendance();
    }, []);

    // Timer simulation for Punch Widget
    useEffect(() => {
        let interval;
        if (isPunchedIn) {
            const startTime = Date.now();
            interval = setInterval(() => {
                const diff = Date.now() - startTime;
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setElapsedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }, 1000);
        } else {
            setElapsedTime("00:00:00");
        }
        return () => clearInterval(interval);
    }, [isPunchedIn]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/employee/attendance");
            const data = await response.json();
            if (data.success) {
                setAttendance(data.data);
            }
        } catch (err) {
            toast.error("Failed to load attendance records");
        } finally {
            setLoading(false);
        }
    };

    const todayRecord = useMemo(() => {
        return attendance.find(record => isSameDay(new Date(record.date), new Date()));
    }, [attendance]);

    const stats = useMemo(() => {
        const filtered = viewMode === 'monthly'
            ? attendance.filter(r => isSameMonth(new Date(r.date), currentDate))
            : attendance.filter(r => isSameYear(new Date(r.date), currentDate));

        const res = {
            present: 0,
            absent: 0,
            halfDay: 0,
            leave: 0,
            totalHours: 0,
            streak: 0,
            punctuality: 0
        };

        filtered.forEach(r => {
            const status = r.status?.toLowerCase();
            if (status === 'present') res.present++;
            else if (status === 'absent') res.absent++;
            else if (status === 'half-day') res.halfDay++;
            else if (status === 'leave') res.leave++;
            res.totalHours += (r.workedHours || 0);
        });

        // Mock Streak and Punctuality for design demo
        res.streak = 12;
        res.punctuality = 95;

        return { ...res, currentMonthRecords: filtered };
    }, [attendance, currentDate, viewMode]);

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'bg-emerald-500 text-white';
            case 'absent': return 'bg-rose-500 text-white';
            case 'half-day': return 'bg-sky-500 text-white';
            case 'leave': return 'bg-amber-500 text-white';
            default: return 'bg-slate-100 text-slate-400';
        }
    };

    const getDayRecord = (day) => {
        return attendance.find(r => isSameDay(new Date(r.date), day));
    };

    const handlePunch = () => {
        setIsPunchedIn(!isPunchedIn);
        toast.success(isPunchedIn ? "Punched out successfully" : "Punched in successfully");
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Hero Header Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-indigo-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight">Track Your Time, <br />Master Your Growth.</h1>
                                <p className="text-indigo-100 mt-4 max-w-md">Your work consistency is your strongest asset. Stay disciplined, stay present.</p>
                            </div>

                            <div className="mt-12 flex flex-wrap gap-6">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                                    <div className="p-2 bg-amber-400 rounded-lg shadow-lg">
                                        <Flame className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Active Streak</p>
                                        <p className="text-xl font-black">{stats.streak} Days</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                                    <div className="p-2 bg-emerald-400 rounded-lg shadow-lg">
                                        <Target className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Punctuality Score</p>
                                        <p className="text-xl font-black">{stats.punctuality}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* High-Fidelity Punch Widget */}
                    <Card className="p-8 border-none bg-white shadow-xl shadow-indigo-100/50 flex flex-col items-center justify-between text-center group">
                        <div className="w-full flex justify-between items-center mb-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isPunchedIn ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                {isPunchedIn ? 'System Active' : 'System Idle'}
                            </span>
                            <Timer className="w-4 h-4 text-slate-300" />
                        </div>

                        <div className="relative mb-8">
                            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${isPunchedIn ? 'bg-indigo-400/30 scale-125' : 'bg-slate-200/0 scale-100'}`}></div>
                            <div className="relative text-5xl font-black text-slate-900 font-mono tracking-tighter">
                                {isPunchedIn ? elapsedTime : "00:00:00"}
                            </div>
                            <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-wide">Work Session Duration</p>
                        </div>

                        <button
                            onClick={handlePunch}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 transform active:scale-95 shadow-lg ${isPunchedIn
                                    ? 'bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-50 shadow-rose-100'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                }`}
                        >
                            {isPunchedIn ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                            {isPunchedIn ? 'Punch Out' : 'Punch In Now'}
                        </button>

                        <div className="w-full mt-6 pt-6 border-t border-slate-100 flex justify-around">
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">In Time</p>
                                <p className="text-xs font-bold text-slate-700">{todayRecord ? format(new Date(todayRecord.checkIn), 'h:mm a') : '--:--'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                                <p className="text-xs font-bold text-indigo-600">{todayRecord ? todayRecord.status : 'N/A'}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Navigation Tabs */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                    <nav className="flex px-2 overflow-x-auto no-scrollbar">
                        <TabButton
                            active={activeTab === "overview"}
                            label="Overview"
                            icon={LayoutDashboard}
                            onClick={() => setActiveTab("overview")}
                        />
                        <TabButton
                            active={activeTab === "calendar"}
                            label="Visual Calendar"
                            icon={Calendar}
                            onClick={() => setActiveTab("calendar")}
                        />
                        <TabButton
                            active={activeTab === "insights"}
                            label="Trends & Analytics"
                            icon={BarChart3}
                            onClick={() => setActiveTab("insights")}
                        />
                        <TabButton
                            active={activeTab === "history"}
                            label="Detailed Logs"
                            icon={ListIcon}
                            onClick={() => setActiveTab("history")}
                        />
                    </nav>
                </div>

                {/* Tab Content: Overview */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <StatCard title="Present Days" value={stats.present} sub="Current Month" icon={CheckCircle2} color="indigo" />
                        <StatCard title="Leave Balance" value={4} sub="Days Available" icon={Briefcase} color="amber" />
                        <StatCard title="Avg. Work Hours" value={`${(stats.totalHours / (stats.present || 1)).toFixed(1)}h`} sub="Daily Average" icon={Clock} color="sky" />
                        <StatCard title="Monthly Goal" value="85%" sub="Compliance" icon={Zap} color="emerald" />
                    </div>
                )}

                {/* Tab Content: Calendar */}
                {activeTab === "calendar" && (
                    <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Visual Attendance Log</h2>
                                <p className="text-sm text-slate-500">FY 2025-26 • {format(currentDate, 'MMMM')}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft className="w-5 h-5" /></button>
                                <span className="text-sm font-bold min-w-[120px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
                                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-4">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{day}</div>
                            ))}
                            {calendarDays.map((day, idx) => {
                                const record = getDayRecord(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                return (
                                    <div
                                        key={idx}
                                        className={`relative group aspect-square rounded-2xl p-2 transition-all flex flex-col items-center justify-center border ${isCurrentMonth ? 'bg-white border-slate-100 hover:border-indigo-300' : 'bg-slate-50/50 border-transparent opacity-30 pointer-events-none'
                                            }`}
                                    >
                                        <span className={`text-sm font-bold ${isToday(day) ? 'text-indigo-600' : 'text-slate-700'}`}>
                                            {format(day, 'd')}
                                        </span>
                                        {record && (
                                            <div className={`mt-2 w-2 h-2 rounded-full ${getStatusStyle(record.status)} shadow-lg shadow-indigo-100`}></div>
                                        )}
                                        {isToday(day) && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                            </div>
                                        )}

                                        {/* Hover Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-3 bg-slate-900 text-white rounded-xl text-[10px] invisible group-hover:visible z-30 shadow-xl line-clamp-2">
                                            {record ? (
                                                <>
                                                    <p className="font-black text-indigo-400">{record.status}</p>
                                                    <p>Time: {format(new Date(record.checkIn), 'h:mm a')}</p>
                                                    <p>Hours: {record.workedHours}h</p>
                                                </>
                                            ) : (
                                                <p className="opacity-60">No Record Found</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-6 pt-8 border-t border-slate-100 justify-center">
                            <LegendItem color="bg-emerald-500" label="Present" />
                            <LegendItem color="bg-rose-500" label="Absent" />
                            <LegendItem color="bg-sky-500" label="Half Day" />
                            <LegendItem color="bg-amber-500" label="Leave" />
                            <LegendItem color="bg-slate-100" label="Weekend/Holiday" />
                        </div>
                    </Card>
                )}

                {/* Tab Content: Insights */}
                {activeTab === "insights" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                                Work Hours Trend
                            </h3>
                            <div className="h-[300px]">
                                <Bar
                                    data={{
                                        labels: stats.currentMonthRecords.map(r => format(new Date(r.date), 'dd')),
                                        datasets: [{
                                            label: 'Hours Worked',
                                            data: stats.currentMonthRecords.map(r => r.workedHours),
                                            backgroundColor: 'rgba(79, 70, 229, 0.4)',
                                            borderColor: 'rgb(79, 70, 229)',
                                            borderWidth: 2,
                                            borderRadius: 8,
                                            barThickness: 12
                                        }]
                                    }}
                                    options={{ maintainAspectRatio: false }}
                                />
                            </div>
                        </Card>
                        <Card className="p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-amber-500" />
                                Distribution
                            </h3>
                            <div className="h-[300px] flex items-center justify-center">
                                <Pie
                                    data={{
                                        labels: ['Present', 'Absent', 'Half Day', 'Leave'],
                                        datasets: [{
                                            data: [stats.present, stats.absent, stats.halfDay, stats.leave],
                                            backgroundColor: [
                                                '#10b981', '#f43f5e', '#0ea5e9', '#f59e0b'
                                            ],
                                            borderWidth: 0,
                                            hoverOffset: 20
                                        }]
                                    }}
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {/* Tab Content: History */}
                {activeTab === "history" && (
                    <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border-none shadow-xl shadow-indigo-100/30">
                        <div className="p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input placeholder="Search logs..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500/10" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                                <Filter className="w-3 h-3" /> Filter Logs
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Day</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Logs</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.currentMonthRecords.map((r, i) => (
                                        <tr key={i} className="group hover:bg-indigo-50/20 transition-all duration-300">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-white shadow-sm transition-all">
                                                        <Calendar className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{format(new Date(r.date), 'MMM dd, yyyy')}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(r.date), 'EEEE')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                        {format(new Date(r.checkIn), 'h:mm a')}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                                        {format(new Date(r.checkOut || r.checkIn), 'h:mm a')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{r.workedHours}h</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <StatusBadge status={r.status} />
                                            </td>
                                            <td className="p-6">
                                                <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, sub, icon: Icon, color }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        sky: 'bg-sky-50 text-sky-600 border-sky-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };
    return (
        <Card className="p-6 hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <div className={`p-3 rounded-2xl w-fit mb-4 ${colors[color]} border`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
            <p className="text-sm font-bold text-slate-900 mt-1">{title}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{sub}</p>
        </Card>
    );
}

const StatusBadge = ({ status }) => {
    const styles = {
        'Present': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Absent': 'bg-rose-50 text-rose-700 border-rose-200',
        'Half Day': 'bg-sky-50 text-sky-700 border-sky-200',
        'Leave': 'bg-amber-50 text-amber-700 border-amber-200',
        'Holiday': 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return (
        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
            {status}
        </span>
    );
};

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
);
