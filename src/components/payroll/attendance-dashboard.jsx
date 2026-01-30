"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  UserCheck,
  UserX,
  Clock,
  Users,
  Plus,
  Search,
  Loader2,
  User,
  Layers,
  ChevronDown,
  ChevronUp,
  Building2,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "@/context/SessionContext";
import { exportToExcel } from "@/utils/exportToExcel";
import toast, { Toaster } from "react-hot-toast";

export default function AttendanceDashboard() {
  const router = useRouter();
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  // View mode: 'daily' or 'monthly'
  const [viewMode, setViewMode] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Organization grouping state
  const [groupByOrganization, setGroupByOrganization] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState({});
  const [expandedEmployees, setExpandedEmployees] = useState({});

  const { user } = useSession();

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/crm/organizations?limit=1000");
      const data = await response.json();

      if (response.ok) {
        const orgs = data.organizations
          .filter((org) => org.name)
          .map((org) => ({
            value: org._id,
            label: org.name,
            name: org.name,
          }));

        setOrganizations(orgs);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  // Fetch employees
  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({
        limit: "1000",
        status: "Active",
      });

      if (selectedOrganization) {
        params.append("organizationId", selectedOrganization);
      }

      const response = await fetch(`/api/payroll/employees?${params}`);
      const data = await response.json();

      console.log(user.role);

      if (user.role === "admin") {
        setEmployees(data.employees || []);
      } else if (user.role === "supervisor") {
        // Filter employees assigned to this supervisor
        console.log("start", data.employees);

        const supervisedEmployees = data?.employees?.filter((emp) => {
          // Check if employee's attendance approval has this supervisor assigned
          const isShift1Supervisor =
            emp.attendanceApproval?.shift1Supervisor === user.id;
          const isShift2Supervisor =
            emp.attendanceApproval?.shift2Supervisor === user.id;

          // Return true if supervisor is assigned to any shift OR they're in same department
          return isShift1Supervisor || isShift2Supervisor;
        });
        console.log(supervisedEmployees);

        setEmployees(supervisedEmployees || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };

  // Fetch attendance based on view mode
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (viewMode === "daily") {
        params.append("date", selectedDate);
      } else {
        // Monthly view
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
        params.append("startDate", startDate.toISOString());
        params.append("endDate", endDate.toISOString());
      }

      if (selectedOrganization) {
        params.append("organizationId", selectedOrganization);
      }

      const response = await fetch(
        `/api/payroll/attendance?${params.toString()}`
      );
      const data = await response.json();

      if (user?.role === "admin") {
        const filteredAttendance = data.attendance || [];
        console.log("Fetched attendance:", filteredAttendance);
        setAttendance(filteredAttendance);
      } else if (user?.role === "supervisor") {
        const supervisedAttendanceRecord = data.attendance || [];
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };
  // const fetchAttendance = async () => {
  //   try {
  //     setLoading(true);
  //     const params = new URLSearchParams();

  //     if (viewMode === "daily") {
  //       params.append("date", selectedDate);
  //     } else {
  //       // Monthly view
  //       const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  //       const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
  //       params.append("startDate", startDate.toISOString());
  //       params.append("endDate", endDate.toISOString());
  //     }

  //     if (selectedOrganization) {
  //       params.append("organizationId", selectedOrganization);
  //     }

  //     const response = await fetch(
  //       `/api/payroll/attendance?${params.toString()}`
  //     );
  //     const data = await response.json();

  //     if (user?.role === "admin") {
  //        const filteredAttendance = data.attendance || [];
  //         console.log("Fetched attendance:", filteredAttendance);
  //       setAttendance(filteredAttendance);
  //     } else if (user?.role === "supervisor") {
  //       const supervisedAttendance = data.attendance || []
  //       console.log(supervisedAttendance);

  //      const supervisedAttendanceRecord =  supervisedAttendance.filter((record) => {
  //         const emp = record.employee;
  //         if (!emp) return false;
  //       console.log("stttttt");

  //         const isShift1Supervisor =
  //           emp.attendanceApproval?.shift1Supervisor === user.id ||
  //           emp.attendanceApproval?.shift1Supervisor === user.name;
  //         const isShift2Supervisor =
  //           emp.attendanceApproval?.shift2Supervisor === user.id ||
  //           emp.attendanceApproval?.shift2Supervisor === user.name;
  //         const isSameDepartment =
  //           emp.jobDetails?.department === user?.department;

  //           console.log("ennnnn");

  //         return isShift1Supervisor || isShift2Supervisor || isSameDepartment;
  //       });
  //       console.log("Fetched attendance:", supervisedAttendanceRecord);
  //       setAttendance(supervisedAttendanceRecord);
  //     }else{
  //        setAttendance([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching attendance:", error);
  //     setAttendance([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (user) fetchEmployees();
  }, [user, selectedOrganization]);

  useEffect(() => {
    if (viewMode === "daily") {
      fetchAttendance();
    }
  }, [selectedDate, selectedOrganization, viewMode]);

  useEffect(() => {
    if (viewMode === "monthly") {
      fetchAttendance();
    }
  }, [selectedMonth, selectedYear, selectedOrganization, viewMode]);

  // Helper function to get organization name from record
  const getOrganizationName = (record) => {
    if (record.employee?.jobDetails?.organizationId?.name) {
      return record.employee.jobDetails.organizationId.name;
    }
    if (record.employee?.jobDetails?.organizationType) {
      return record.employee.jobDetails.organizationType;
    }
    return "Unassigned";
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  // Get monthly attendance data grouped by employee
  const getMonthlyAttendanceByEmployee = () => {
    const employeeMap = {};

    attendance.forEach((record) => {
      const empId = record.employee?._id;
      if (!empId) return;

      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          employee: record.employee,
          organization: getOrganizationName(record),
          records: {},
          stats: {
            totalPresent: 0,
            totalAbsent: 0,
            totalLeave: 0,
            totalHours: 0,
            totalOvertime: 0,
          },
        };
      }

      const dateObj = new Date(record.date);
      const day = dateObj.getDate();
      // console.log(`Debug: Date: ${record.date}, Parsed Day: ${day}, Status: ${record.status}`);
      employeeMap[empId].records[day] = record;

      // Update stats
      if (record.status === "Present") employeeMap[empId].stats.totalPresent++;
      else if (record.status === "Absent")
        employeeMap[empId].stats.totalAbsent++;
      else if (record.status === "Leave") employeeMap[empId].stats.totalLeave++;

      if (record.totalHours) {
        employeeMap[empId].stats.totalHours += parseFloat(record.totalHours);
      }

      if (record.overtimeHours) {
        employeeMap[empId].stats.totalOvertime += parseFloat(
          record.overtimeHours
        );
      }
    });

    return Object.values(employeeMap);
  };

  // Group monthly attendance by organization
  const getGroupedMonthlyAttendance = () => {
    const employeeData = getMonthlyAttendanceByEmployee();
    const grouped = {};

    employeeData.forEach((empData) => {
      const orgName = empData.organization;

      if (!grouped[orgName]) {
        grouped[orgName] = {
          name: orgName,
          employees: [],
          count: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalLeave: 0,
          totalHours: 0,
          totalOvertime: 0,
        };
      }

      grouped[orgName].employees.push(empData);
      grouped[orgName].count++;
      grouped[orgName].totalPresent += empData.stats.totalPresent;
      grouped[orgName].totalAbsent += empData.stats.totalAbsent;
      grouped[orgName].totalLeave += empData.stats.totalLeave;
      grouped[orgName].totalHours += empData.stats.totalHours;
      grouped[orgName].totalOvertime += empData.stats.totalOvertime;
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.name === "Unassigned") return 1;
      if (b.name === "Unassigned") return -1;
      return a.name.localeCompare(b.name);
    });
  };

  // Group attendance by organization (for daily view)
  const getGroupedAttendance = () => {
    const grouped = {};

    attendance.forEach((record) => {
      const orgName = getOrganizationName(record);

      if (!grouped[orgName]) {
        grouped[orgName] = {
          name: orgName,
          records: [],
          count: 0,
          present: 0,
          absent: 0,
          leave: 0,
        };
      }

      grouped[orgName].records.push(record);
      grouped[orgName].count++;

      if (record.status === "Present") grouped[orgName].present++;
      else if (record.status === "Absent") grouped[orgName].absent++;
      else if (record.status === "Leave") grouped[orgName].leave++;
    });

    const groupedArray = Object.values(grouped).sort((a, b) => {
      if (a.name === "Unassigned") return 1;
      if (b.name === "Unassigned") return -1;
      return a.name.localeCompare(b.name);
    });

    return groupedArray;
  };

  // Toggle organization expansion
  const toggleOrganization = (orgName) => {
    setExpandedOrgs((prev) => ({
      ...prev,
      [orgName]: !prev[orgName],
    }));
  };

  // Toggle employee expansion (for monthly view)
  const toggleEmployee = (empId) => {
    setExpandedEmployees((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
  };

  // Expand/Collapse all
  const expandAllOrganizations = () => {
    const allExpanded = {};
    if (viewMode === "daily") {
      getGroupedAttendance().forEach((org) => {
        allExpanded[org.name] = true;
      });
    } else {
      getGroupedMonthlyAttendance().forEach((org) => {
        allExpanded[org.name] = true;
      });
    }
    setExpandedOrgs(allExpanded);
  };

  const collapseAllOrganizations = () => {
    setExpandedOrgs({});
  };

  const expandAllEmployees = () => {
    const allExpanded = {};
    getMonthlyAttendanceByEmployee().forEach((empData) => {
      allExpanded[empData.employee._id] = true;
    });
    setExpandedEmployees(allExpanded);
  };

  const collapseAllEmployees = () => {
    setExpandedEmployees({});
  };

  // Toggle grouping mode
  const handleGroupToggle = () => {
    const newGroupState = !groupByOrganization;
    setGroupByOrganization(newGroupState);

    if (newGroupState) {
      setTimeout(() => {
        expandAllOrganizations();
      }, 100);
    }
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (viewMode === "daily") {
      const presentToday = attendance.filter(
        (record) => record.status === "Present"
      ).length;
      const absentToday = attendance.filter(
        (record) => record.status === "Absent"
      ).length;
      const leaveToday = attendance.filter(
        (record) => record.status === "Leave"
      ).length;

      return {
        present: presentToday,
        absent: absentToday,
        leave: leaveToday,
        total: employees.length,
      };
    } else {
      // Monthly stats
      const employeeData = getMonthlyAttendanceByEmployee();
      const totalPresent = employeeData.reduce(
        (sum, emp) => sum + emp.stats.totalPresent,
        0
      );
      const totalAbsent = employeeData.reduce(
        (sum, emp) => sum + emp.stats.totalAbsent,
        0
      );
      const totalLeave = employeeData.reduce(
        (sum, emp) => sum + emp.stats.totalLeave,
        0
      );
      const totalHours = employeeData.reduce(
        (sum, emp) => sum + emp.stats.totalHours,
        0
      );
      const totalOvertime = employeeData.reduce(
        (sum, emp) => sum + emp.stats.totalOvertime,
        0
      );

      return {
        present: totalPresent,
        absent: totalAbsent,
        leave: totalLeave,
        total: employeeData.length,
        totalHours: totalHours.toFixed(1),
        totalOvertime: totalOvertime.toFixed(1),
      };
    }
  };

  const stats = calculateStatistics();

  // Filter attendance
  const filteredAttendance = attendance.filter((record) => {
    const fullName =
      `${record.employee?.personalDetails?.firstName} ${record.employee?.personalDetails?.lastName}`.toLowerCase();
    const employeeId = record.employee?.employeeId?.toLowerCase() || "";
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      employeeId.includes(searchTerm.toLowerCase())
    );
  });

  // Export function
  const handleExport = async () => {
    try {
      setExportLoading(true);

      let exportData = [];

      if (viewMode === "daily") {
        exportData = filteredAttendance.map((record) => ({
          "Employee ID": record.employee?.employeeId || "N/A",
          "Employee Name": `${record.employee?.personalDetails?.firstName || ""
            } ${record.employee?.personalDetails?.lastName || ""}`.trim(),
          Organization: getOrganizationName(record),
          Department: record.employee?.jobDetails?.department || "N/A",
          Date: new Date(record.date).toLocaleDateString(),
          Status: record.status,
          "Check In": record.checkIn
            ? new Date(record.checkIn).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "N/A",
          "Check Out": record.checkOut
            ? new Date(record.checkOut).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
            : "N/A",
          "Total Hours": record.totalHours || "N/A",
          "Overtime Hours": record.overtimeHours || "N/A",
        }));
      } else {
        // Monthly export
        const employeeData = getMonthlyAttendanceByEmployee();
        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

        exportData = employeeData.map((empData) => {
          const row = {
            "Employee ID": empData.employee?.employeeId || "N/A",
            "Employee Name": `${empData.employee?.personalDetails?.firstName || ""
              } ${empData.employee?.personalDetails?.lastName || ""}`.trim(),
            Organization: empData.organization,
            "Total Present": empData.stats.totalPresent,
            "Total Absent": empData.stats.totalAbsent,
            "Total Leave": empData.stats.totalLeave,
            "Total Hours": empData.stats.totalHours.toFixed(2),
            "Overtime Hours": empData.stats.totalOvertime.toFixed(2),
          };

          // Add daily data
          for (let day = 1; day <= daysInMonth; day++) {
            const record = empData.records[day];
            if (record) {
              row[`Day ${day} Status`] = record.status;
              row[`Day ${day} Hours`] = record.totalHours || 0;
            } else {
              row[`Day ${day} Status`] = "-";
              row[`Day ${day} Hours`] = 0;
            }
          }

          return row;
        });
      }

      if (exportData.length > 0) {
        const filename =
          viewMode === "daily"
            ? `attendance_${selectedDate}`
            : `attendance_${months.find((m) => m.value === selectedMonth)?.label
            }_${selectedYear}`;
        exportToExcel(exportData, filename);
      } else {
        toast.error("No data available to export");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Error exporting data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      Present: "bg-green-50 text-green-700 border-green-200",
      Absent: "bg-red-50 text-red-700 border-red-200",
      "Half-day": "bg-yellow-50 text-yellow-700 border-yellow-200",
      Leave: "bg-slate-50 text-blue-700 border-blue-200",
      Weekend: "bg-slate-50 text-slate-700 border-slate-200",
      Holiday: "bg-purple-50 text-purple-700 border-purple-200",
    };

    const color = statusConfig[status] || statusConfig.Absent;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${color}`}
      >
        {status}
      </span>
    );
  };

  // Month navigation
  const handleMonthChange = (direction) => {
    if (direction === "next") {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-slate-600 font-medium">
            Loading attendance data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  Attendance Management
                </h1>
                <p className="text-slate-600">
                  Track and manage employee attendance records
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exportLoading ? "Exporting..." : "Export"}
              </button>
              {user.role === "admin" && <button
                onClick={() => router.push("/payroll/attendance/import")}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                Import Excel
              </button>}
              <button
                onClick={() =>
                  router.push("/payroll/attendance/add-attendance")
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Attendance
              </button>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="border-b border-slate-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setViewMode("daily")}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${viewMode === "daily"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
              >
                <Calendar className="w-4 h-4" />
                Daily View
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${viewMode === "monthly"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
              >
                <Layers className="w-4 h-4" />
                Monthly View
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="flex flex-wrap gap-6 mb-8 overflow-x-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Employees
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {viewMode === "daily"
                    ? "Active workforce"
                    : "Tracked this month"}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {viewMode === "daily" ? "Present Today" : "Total Present"}
                </p>
                <p className="text-2xl font-bold text-green-700 mt-2">
                  {stats.present}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {viewMode === "daily" && stats.total > 0
                    ? `${((stats.present / stats.total) * 100).toFixed(
                      1
                    )}% present`
                    : "Days present"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {viewMode === "daily" ? "Absent Today" : "Total Absent"}
                </p>
                <p className="text-2xl font-bold text-red-700 mt-2">
                  {stats.absent}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {viewMode === "daily" && stats.total > 0
                    ? `${((stats.absent / stats.total) * 100).toFixed(
                      1
                    )}% absent`
                    : "Days absent"}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">On Leave</p>
                <p className="text-2xl font-bold text-yellow-700 mt-2">
                  {stats.leave}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.total > 0
                    ? `${((stats.leave / stats.total) * 100).toFixed(
                      1
                    )}% on leave`
                    : "On leave"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {viewMode === "monthly" && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Hours
                    </p>
                    <p className="text-2xl font-bold text-blue-700 mt-2">
                      {stats.totalHours}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Hours worked this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-blue-100">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Overtime Hours
                    </p>
                    <p className="text-2xl font-bold text-purple-700 mt-2">
                      {stats.totalOvertime}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Extra hours worked
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Organization Grouping Toggle */}
        <div
          className={`bg-white rounded-xl border-2 transition-all ${groupByOrganization
            ? "border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50"
            : "border-slate-200"
            } shadow-sm mb-8`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${groupByOrganization ? "bg-indigo-500" : "bg-slate-100"
                    }`}
                >
                  <Layers
                    className={`w-5 h-5 ${groupByOrganization ? "text-white" : "text-slate-500"
                      }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Organization-wise Grouping
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {groupByOrganization
                      ? "Attendance is grouped by organization"
                      : "Click to group attendance by organization"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {groupByOrganization && (
                  <>
                    <button
                      onClick={
                        viewMode === "monthly"
                          ? expandAllEmployees
                          : expandAllOrganizations
                      }
                      className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors border border-indigo-200"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={
                        viewMode === "monthly"
                          ? collapseAllEmployees
                          : collapseAllOrganizations
                      }
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    >
                      Collapse All
                    </button>
                  </>
                )}

                <button
                  onClick={handleGroupToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${groupByOrganization ? "bg-indigo-500" : "bg-slate-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${groupByOrganization ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Filter Attendance
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Organization Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Organization
                </label>
                <select
                  value={selectedOrganization}
                  onChange={(e) => setSelectedOrganization(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                >
                  <option value="">All Organizations</option>
                  {organizations.map((org) => (
                    <option key={org.value} value={org.value}>
                      {org.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date/Month Picker */}
              {viewMode === "daily" ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Month
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Search */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Search Employee
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or ID..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DAILY VIEW CONTENT */}
        {viewMode === "daily" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {groupByOrganization ? "Organizations" : "Attendance Records"} -{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {attendance.length} record{attendance.length !== 1 ? "s" : ""}{" "}
                found
              </p>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No attendance records
                </h3>
                <p className="text-slate-600">
                  No attendance has been marked for this date yet.
                </p>
              </div>
            ) : groupByOrganization ? (
              // Grouped View
              <div className="divide-y divide-slate-200">
                {getGroupedAttendance().map((org) => (
                  <div key={org.name}>
                    <div
                      onClick={() => toggleOrganization(org.name)}
                      className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              {org.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-slate-600">
                                {org.count} employee{org.count !== 1 ? "s" : ""}
                              </p>
                              <span className="text-xs text-green-600 font-medium">
                                {org.present} present
                              </span>
                              <span className="text-xs text-red-600 font-medium">
                                {org.absent} absent
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                {org.leave} leave
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {expandedOrgs[org.name] ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedOrgs[org.name] && (
                      <div className="p-6 space-y-4">
                        {org.records.map((record) => (
                          <div
                            key={record._id}
                            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {record.employee?.personalDetails?.firstName}{" "}
                                  {record.employee?.personalDetails?.lastName}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-sm text-slate-600">
                                    ID: {record.employee?.employeeId}
                                  </p>
                                  {record.checkIn && (
                                    <p className="text-sm text-slate-500">
                                      In:{" "}
                                      {new Date(
                                        record.checkIn
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  )}
                                  {record.checkOut && (
                                    <p className="text-sm text-slate-500">
                                      Out:{" "}
                                      {new Date(
                                        record.checkOut
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  )}
                                  {record.totalHours > 0 && (
                                    <p className="text-sm text-blue-600 font-medium">
                                      {record.totalHours}h
                                    </p>
                                  )}
                                  {record.dayType && (
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${record.dayType === "Full"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                        }`}
                                    >
                                      {record.dayType} Day
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>{getStatusBadge(record.status)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Flat View
              <div className="p-6 space-y-4">
                {filteredAttendance.map((record) => (
                  <div
                    key={record._id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {record.employee?.personalDetails?.firstName}{" "}
                          {record.employee?.personalDetails?.lastName}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-slate-600">
                            ID: {record.employee?.employeeId}
                          </p>
                          <p className="text-sm text-slate-500">
                            {getOrganizationName(record)}
                          </p>
                          {record.checkIn && (
                            <p className="text-sm text-slate-500">
                              In:{" "}
                              {new Date(record.checkIn).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          )}
                          {record.checkOut && (
                            <p className="text-sm text-slate-500">
                              Out:{" "}
                              {new Date(record.checkOut).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          )}
                          {record.totalHours > 0 && (
                            <p className="text-sm text-blue-600 font-medium">
                              {record.totalHours}h
                            </p>
                          )}
                          {record.dayType && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${record.dayType === "Full"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                              {record.dayType} Day
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(record.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MONTHLY VIEW CONTENT */}
        {viewMode === "monthly" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Monthly Attendance -{" "}
                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                    {selectedYear}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {getMonthlyAttendanceByEmployee().length} employee
                    {getMonthlyAttendanceByEmployee().length !== 1 ? "s" : ""}{" "}
                    tracked
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleMonthChange("prev")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMonthChange("next")}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {getMonthlyAttendanceByEmployee().length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No attendance records
                </h3>
                <p className="text-slate-600">
                  No attendance has been marked for this month yet.
                </p>
              </div>
            ) : groupByOrganization ? (
              // Grouped by Organization
              <div className="divide-y divide-slate-200">
                {getGroupedMonthlyAttendance().map((org) => (
                  <div key={org.name}>
                    <div
                      onClick={() => toggleOrganization(org.name)}
                      className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              {org.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-slate-600">
                                {org.count} employee{org.count !== 1 ? "s" : ""}
                              </p>
                              <span className="text-xs text-green-600 font-medium">
                                {org.totalPresent} present days
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                {org.totalHours.toFixed(1)} total hours
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {expandedOrgs[org.name] ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedOrgs[org.name] && (
                      <div className="p-6 space-y-4">
                        {org.employees.map((empData) => {
                          const daysInMonth = getDaysInMonth(
                            selectedMonth,
                            selectedYear
                          );

                          return (
                            <div
                              key={empData.employee._id}
                              className="border border-slate-200 rounded-xl overflow-hidden"
                            >
                              <div
                                onClick={() =>
                                  toggleEmployee(empData.employee._id)
                                }
                                className="px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                      <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-slate-900 text-sm">
                                        {
                                          empData.employee.personalDetails
                                            ?.firstName
                                        }{" "}
                                        {
                                          empData.employee.personalDetails
                                            ?.lastName
                                        }
                                      </h4>
                                      <p className="text-xs text-slate-500">
                                        ID: {empData.employee.employeeId}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="text-right">
                                      <p className="text-xs text-slate-600">
                                        Present
                                      </p>
                                      <p className="text-sm font-bold text-green-700">
                                        {empData.stats.totalPresent}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-slate-600">
                                        Total Hours
                                      </p>
                                      <p className="text-sm font-bold text-blue-700">
                                        {empData.stats.totalHours.toFixed(1)}h
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-slate-600">
                                        Overtime
                                      </p>
                                      <p className="text-sm font-bold text-purple-700">
                                        {empData.stats.totalOvertime.toFixed(1)}
                                        h
                                      </p>
                                    </div>
                                    {expandedEmployees[empData.employee._id] ? (
                                      <ChevronUp className="w-4 h-4 text-slate-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-slate-500" />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {expandedEmployees[empData.employee._id] && (
                                <div className="p-4 bg-white">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-slate-200">
                                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                            Day
                                          </th>
                                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                            Status
                                          </th>
                                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                            In Time
                                          </th>
                                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                            Out Time
                                          </th>
                                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                            Total Hrs
                                          </th>
                                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                            Day Type
                                          </th>
                                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                            Overtime
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {Array.from(
                                          { length: daysInMonth },
                                          (_, i) => i + 1
                                        ).map((day) => {
                                          const record = empData.records[day];
                                          const date = new Date(
                                            selectedYear,
                                            selectedMonth - 1,
                                            day
                                          );
                                          const dayName =
                                            date.toLocaleDateString("en-US", {
                                              weekday: "short",
                                            });
                                          const isSunday = date.getDay() === 0;

                                          return (
                                            <tr
                                              key={day}
                                              className={`hover:bg-slate-50 ${isSunday ? "bg-red-50" : ""
                                                }`}
                                            >
                                              <td className="py-2 px-3">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium text-slate-900">
                                                    {day}
                                                  </span>
                                                  <span className="text-xs text-slate-500">
                                                    {dayName}
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="py-2 px-3">
                                                {record ? (
                                                  getStatusBadge(record.status)
                                                ) : (
                                                  <span className="text-xs text-slate-400">
                                                    -
                                                  </span>
                                                )}
                                              </td>
                                              <td className="py-2 px-3 text-slate-700">
                                                {record?.checkIn
                                                  ? new Date(
                                                    record.checkIn
                                                  ).toLocaleTimeString(
                                                    "en-US",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    }
                                                  )
                                                  : "-"}
                                              </td>
                                              <td className="py-2 px-3 text-slate-700">
                                                {record?.checkOut
                                                  ? new Date(
                                                    record.checkOut
                                                  ).toLocaleTimeString(
                                                    "en-US",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                    }
                                                  )
                                                  : "-"}
                                              </td>
                                              <td className="py-2 px-3">
                                                {record?.totalHours ? (
                                                  <span className="font-medium text-blue-700">
                                                    {record.totalHours}h
                                                  </span>
                                                ) : (
                                                  <span className="text-xs text-slate-400">
                                                    -
                                                  </span>
                                                )}
                                              </td>
                                              <td className="py-2 px-3">
                                                {record?.dayType ? (
                                                  <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${record.dayType === "Full"
                                                      ? "bg-green-100 text-green-800"
                                                      : "bg-yellow-100 text-yellow-800"
                                                      }`}
                                                  >
                                                    {record.dayType} Day
                                                  </span>
                                                ) : (
                                                  <span className="text-xs text-slate-400">
                                                    -
                                                  </span>
                                                )}
                                              </td>
                                              <td className="py-2 px-3">
                                                {record?.overtimeHours &&
                                                  record.overtimeHours > 0 ? (
                                                  <span className="font-medium text-purple-700">
                                                    {record.overtimeHours}h
                                                  </span>
                                                ) : (
                                                  <span className="text-xs text-slate-400">
                                                    -
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                                          <td
                                            className="py-3 px-3 text-slate-900"
                                            colSpan="2"
                                          >
                                            Total
                                          </td>
                                          <td className="py-3 px-3 text-green-700">
                                            {empData.stats.totalPresent} days
                                          </td>
                                          <td className="py-3 px-3 text-red-700">
                                            {empData.stats.totalAbsent} days
                                          </td>
                                          <td className="py-3 px-3 text-blue-700">
                                            {empData.stats.totalHours.toFixed(
                                              1
                                            )}
                                            h
                                          </td>
                                          <td className="py-3 px-3 text-purple-700">
                                            {empData.stats.totalOvertime.toFixed(
                                              1
                                            )}
                                            h
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Flat List View
              <div className="p-6 space-y-4">
                {getMonthlyAttendanceByEmployee()
                  .filter((empData) => {
                    const fullName =
                      `${empData.employee.personalDetails?.firstName} ${empData.employee.personalDetails?.lastName}`.toLowerCase();
                    const employeeId =
                      empData.employee.employeeId?.toLowerCase() || "";
                    return (
                      fullName.includes(searchTerm.toLowerCase()) ||
                      employeeId.includes(searchTerm.toLowerCase())
                    );
                  })
                  .map((empData) => {
                    const daysInMonth = getDaysInMonth(
                      selectedMonth,
                      selectedYear
                    );

                    return (
                      <div
                        key={empData.employee._id}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                      >
                        <div
                          onClick={() => toggleEmployee(empData.employee._id)}
                          className="px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 text-sm">
                                  {empData.employee.personalDetails?.firstName}{" "}
                                  {empData.employee.personalDetails?.lastName}
                                </h4>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-xs text-slate-500">
                                    ID: {empData.employee.employeeId}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {empData.organization}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-xs text-slate-600">
                                  Present
                                </p>
                                <p className="text-sm font-bold text-green-700">
                                  {empData.stats.totalPresent}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-600">
                                  Total Hours
                                </p>
                                <p className="text-sm font-bold text-blue-700">
                                  {empData.stats.totalHours.toFixed(1)}h
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-600">
                                  Overtime
                                </p>
                                <p className="text-sm font-bold text-purple-700">
                                  {empData.stats.totalOvertime.toFixed(1)}h
                                </p>
                              </div>
                              {expandedEmployees[empData.employee._id] ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        {expandedEmployees[empData.employee._id] && (
                          <div className="p-4 bg-white">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                      Day
                                    </th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                      Status
                                    </th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                      In Time
                                    </th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                      Out Time
                                    </th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">
                                      Total Hrs
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {Array.from(
                                    { length: daysInMonth },
                                    (_, i) => i + 1
                                  ).map((day) => {
                                    const record = empData.records[day];
                                    const date = new Date(
                                      selectedYear,
                                      selectedMonth - 1,
                                      day
                                    );
                                    const dayName = date.toLocaleDateString(
                                      "en-US",
                                      { weekday: "short" }
                                    );
                                    const isSunday = date.getDay() === 0;

                                    return (
                                      <tr
                                        key={day}
                                        className={`hover:bg-slate-50 ${isSunday ? "bg-red-50" : ""
                                          }`}
                                      >
                                        <td className="py-2 px-3">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900">
                                              {day}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                              {dayName}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-2 px-3">
                                          {record ? (
                                            getStatusBadge(record.status)
                                          ) : (
                                            <span className="text-xs text-slate-400">
                                              -
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-700">
                                          {record?.checkIn
                                            ? new Date(
                                              record.checkIn
                                            ).toLocaleTimeString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                            : "-"}
                                        </td>
                                        <td className="py-2 px-3 text-slate-700">
                                          {record?.checkOut
                                            ? new Date(
                                              record.checkOut
                                            ).toLocaleTimeString("en-US", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                            : "-"}
                                        </td>
                                        <td className="py-2 px-3">
                                          {record?.totalHours ? (
                                            <span className="font-medium text-blue-700">
                                              {record.totalHours}h
                                            </span>
                                          ) : (
                                            <span className="text-xs text-slate-400">
                                              -
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                                    <td
                                      className="py-3 px-3 text-slate-900"
                                      colSpan="2"
                                    >
                                      Total
                                    </td>
                                    <td className="py-3 px-3 text-green-700">
                                      {empData.stats.totalPresent} days
                                    </td>
                                    <td className="py-3 px-3 text-red-700">
                                      {empData.stats.totalAbsent} days
                                    </td>
                                    <td className="py-3 px-3 text-blue-700">
                                      {empData.stats.totalHours.toFixed(1)}h
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
