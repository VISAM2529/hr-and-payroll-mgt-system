"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cog,
  Users,
  CreditCard,
  CheckSquare,
  BarChart3,
  Menu,
  X,
  Award,
  ChevronDown,
  Home,
  Bell,
  Search,
  User,
  Shield,
  Calculator,
  FileText,
  List,
  Plus,
  Target,
  Calendar,
  LogOut,
  UserCheck,
  Eye,
  ShoppingCart,
  History,
  Banknote,
  Aperture,
  BanknoteArrowUp,
  CalculatorIcon,
  File,
  Building2,
  ShieldCheck,
  Contact,
  CalendarRange,
  Receipt,
  Clock,
  Lock,
  GitGraph,
  Settings2,
  Briefcase,
  Speaker,
  MessageSquare,
} from "lucide-react";
import "../globals.css";
import { useSession } from "@/context/SessionContext";
import Image from "next/image";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, isLoading, logout } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  console.log("User From Layout: - ", user, "IsLoading: - ", isLoading);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      setRole(user.role);
      setLoadingRole(false);
    }
  }, [user, isLoading, router, pathname]);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const isActive = (href) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const adminNavigation = [
    // { name: "Dashboard", href: "/", icon: Home },
    {
      name: "Payroll Management",
      href: "/dashboard/payroll",
      icon: CreditCard,
      children: [
        { name: "Employee Directory", href: "/payroll/employees", icon: Users },
        {
          name: "Attendance Directory",
          href: "/payroll/attendance",
          icon: UserCheck,
        },
        {
          name: "Payslip Generation",
          href: "/payroll/payslip",
          icon: FileText,
        },
        {
          name: "Payroll Run",
          href: "/payroll/run",
          icon: Banknote,
        },
        {
          name: "Salary Components",
          href: "/payroll/components",
          icon: CalculatorIcon,
        },
        {
          name: "Compliance Settings",
          href: "/payroll/settings",
          icon: Shield,
        },
        {
          name: "Leave Management",
          href: "/payroll/leaves",
          icon: CalendarRange,
        },
        {
          name: "Leave Approvals",
          href: "/payroll/leave-approvals",
          icon: CheckSquare,
        },
        {
          name: "Investment Reviews",
          href: "/payroll/investments",
          icon: ShieldCheck,
        },
        {
          name: "My Portal (ESS)",
          href: "/ess",
          icon: Eye,
        },
        {
          name: "Talent Management",
          href: "/talent",
          icon: Award,
        },
      ],
    },
    {
      name: "CRM Management",
      href: "/dashboard/crm",
      icon: Cog,
      children: [
        { name: "Organizations", href: "/crm/organizations", icon: Building2 },
        { name: "Department", href: "/crm/department", icon: Building2 },
        { name: "Employee", href: "/crm/employeeType", icon: Contact },
        {
          name: "Attendance Thresholds",
          href: "/crm/attendance-thresholds",
          icon: Target,
        },
        { name: "Org Chart", href: "/crm/org-chart", icon: GitGraph },
        { name: "Org Settings", href: "/crm/org-settings", icon: Settings2 },
        // { name: "Permissions", href: "/crm/permissions", icon: Shield },
        // { name: 'Payslip Structure', href: '/crm/payslip-structure', icon: FileText },
      ],
    },
    {
      name: "Recruitment",
      href: "/recruitment",
      icon: Briefcase,
      children: [
        { name: "Recruitment Hub", href: "/recruitment", icon: GitGraph },
        { name: "Onboarding Tracker", href: "/recruitment/onboarding", icon: UserCheck },
      ],
    },
    {
      name: "Finance & Accounting",
      href: "/finance",
      icon: CreditCard,
      children: [
        { name: "Finance Hub", href: "/finance", icon: GitGraph },
        { name: "Expense Claims", href: "/finance/expenses", icon: Receipt },
        { name: "General Ledger", href: "/finance/ledger", icon: History },
        { name: "Vendor Management", href: "/finance/vendors", icon: Users },
      ],
    },
    {
      name: "Communication Hub",
      href: "/communication",
      icon: MessageSquare, // Ensure MessageSquare is imported
      children: [
        { name: "Announcements", href: "/communication/announcements", icon: Speaker },
        { name: "Surveys", href: "/communication/surveys", icon: FileText },
      ]
    },
    {
      name: "Activity Logs",
      href: "/logs",
      icon: Clock,
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      children: [
        { name: "Notifications", href: "/notifications", icon: Bell },
        // {
        //   name: "Notification Settings",
        //   href: "/notifications/notification-settings",
        //   icon: Bell,
        // },
      ],
    },
  ];

  const supervisorNavigation = [
    {
      name: "Attendance Directory",
      href: "/payroll/attendance",
      icon: UserCheck,
    },
    { name: "My Payslip", href: "/payroll/my-payslip", icon: Receipt },
    { name: "My Portal (ESS)", href: "/ess", icon: Eye },
  ];

  // Employee navigation with only Dashboard and My Payslip
  let employeeNavigation = [
    // { name: "Dashboard", href: "/", icon: Home },
    { name: "My Portal (ESS)", href: "/ess", icon: Eye },
    { name: "My Payslip", href: "/payroll/my-payslip", icon: Receipt },
    { name: "My Attendance", href: "/attendance", icon: UserCheck },
    { name: "Change Password", href: "/change-password", icon: Lock },
  ];

  // Attendance-only user navigation - minimal access
  const attendanceOnlyNavigation = [
    {
      name: "Attendance Directory",
      href: "/payroll/attendance",
      icon: UserCheck,
    },
    { name: "Change Password", href: "/change-password", icon: Lock },
  ];

  // Define mapping of permissions to navigation items
  // You can extend this map to include any other permissions and their corresponding routes
  const PERMISSION_NAV_MAP = {
    'view_departments': { name: "Department", href: "/crm/department", icon: Building2 },
    'manage_departments': { name: "Department", href: "/crm/department", icon: Building2 },
    'view_organizations': { name: "Organizations", href: "/crm/organizations", icon: Building2 },
    'manage_permissions': { name: "Permissions", href: "/crm/permissions", icon: Shield },
    'manage_employees': { name: "Employee Directory", href: "/payroll/employees", icon: Users },
    'view_attendance': { name: "Attendance Directory", href: "/payroll/attendance", icon: UserCheck },
    // Example for the user's request:
    // 'add_product': { name: "Add Product", href: "/products/add", icon: Plus }, 
  };

  // Dynamically add items to employee navigation based on permissions
  if (role === 'employee' && user?.permissions?.length > 0) {
    user.permissions.forEach(permSlug => {
      const navItem = PERMISSION_NAV_MAP[permSlug];
      // Check if item exists and isn't already in the list
      if (navItem && !employeeNavigation.some(item => item.href === navItem.href)) {
        employeeNavigation.push(navItem);
      }
    });
  }

  let navigation = [];
  if (role === "admin") {
    navigation = adminNavigation;
  } else if (role === "employee") {
    navigation = employeeNavigation;
  } else if (role === "supervisor") {
    navigation = supervisorNavigation;
  } else if (role === "attendance_only") {
    navigation = attendanceOnlyNavigation;
  } else {
    navigation = [];
  }

  console.log("Navigation :- ", navigation);

  const isAuthRoute =
    pathname?.startsWith("/auth") || pathname === "/auth/login";
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isLoading || loadingRole) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-700 font-semibold">
        Loading dashboard...
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl border-r border-indigo-100 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col h-screen`}
      >
        <div className="flex-shrink-0 p-6 border-b border-indigo-50 bg-white">
          <div className="flex items-center space-x-3 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">HRPayroll</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation?.map((item) => (
            <div key={item.name} className="space-y-1">
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center w-full p-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${pathname?.startsWith(item.href)
                      ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                      }`}
                    aria-expanded={openMenu === item.name}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${pathname?.startsWith(item.href)
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100/50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 text-left">{item.name}</span>
                    <div
                      className={`transition-transform duration-200 ${openMenu === item.name ? "rotate-180" : ""
                        }`}
                    >
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>

                  {openMenu === item.name && (
                    <div className="ml-4 pl-4 mt-2 space-y-1 border-l-2 border-slate-100">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center p-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(child.href)
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                            }`}
                        >
                          {child.icon && (
                            <child.icon
                              className={`h-4 w-4 mr-3 ${isActive(child.href)
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover:text-indigo-500"
                                }`}
                            />
                          )}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isActive(item.href)
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${isActive(item.href)
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-100/50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-200">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {user?.personalDetails?.firstName ||
                    (role === "admin" ? "Admin User" : "Employee User")}
                </p>
                <p className="text-xs text-indigo-600 font-medium capitalize bg-indigo-50 px-2 py-0.5 rounded-full w-fit mt-0.5">{role}</p>
              </div>
            </div>
            <button
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:ml-80">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm border-b border-indigo-100">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                <div className="hidden md:block">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search employees, reports, tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                      aria-label="Search employees, reports, or tasks"
                    />
                  </div>
                </div>
                <button
                  className="md:hidden p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  aria-label="Open search"
                  onClick={() => {
                    /* Implement mobile search modal */
                  }}
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  className="relative p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900">
                      Welcome,{" "}
                      {user?.personalDetails?.firstName ||
                        (role === "admin" ? "Admin" : "Employee")}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{role}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md shadow-indigo-200 ring-2 ring-white">
                    <span className="text-white font-bold text-sm">
                      {user?.personalDetails?.firstName
                        ?.charAt(0)
                        ?.toUpperCase() || role?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="bg-slate-50 min-h-[calc(100vh-80px)]">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}