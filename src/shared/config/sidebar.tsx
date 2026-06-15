import {
    LayoutDashboard,
    BarChart3,
    FolderKanban,
    Settings,
    Building2,
    Shield,
    Sunrise,
    ClipboardList,
    Target,
    Star,
    CalendarCheck,
    FileText,
    Clock,
    Users,
    DollarSign,
    SlidersHorizontal,
    Receipt,
    CreditCard,
    CalendarDays,
    CalendarOff,
    ArrowLeftRight,
    UserCog,
    ListTodo,
} from "lucide-react";

export const SidebarConfig = [
    {
        title: "Overview",
        items: [
            {
                title: "My Workspace",
                href: "/dashboard/my-workspace",
                icon: LayoutDashboard,
            },
            {
                title: "Company Analytics",
                href: "/dashboard/analytics",
                icon: BarChart3,
                permission: "view_global_stats",
            },
            {
                title: "Reports",
                href: "/dashboard/reports",
                icon: FileText,
                permission: "view_reports",
            },
            {
                title: "Morning SOP",
                href: "/dashboard/sop",
                icon: Sunrise,
                permission: "view_morning_sop",
            },
        ],
    },
    {
        title: "CRM",
        items: [
            {
                title: "Clients",
                href: "/dashboard/clients",
                icon: Building2,
                permission: "view_clients",
            },
            {
                title: "Sales Pipeline",
                href: "/dashboard/leads",
                icon: Target,
                permission: "view_leads",
            },
        ],
    },
    {
        title: "Project Management",
        items: [
            {
                title: "Projects",
                href: "/dashboard/projects",
                icon: FolderKanban,
                permission: "view_projects",
            },
            {
                title: "My Tasks",
                href: "/dashboard/my-tasks",
                icon: ListTodo,
                permission: "view_personal_tasks",
            },
        ],
    },
    {
        title: "HR & Payroll",
        items: [
            {
                title: "My Points",
                href: "/dashboard/hr/my-points",
                icon: Star,
                permission: "view_my_points",
            },
            {
                title: "My Attendance",
                href: "/dashboard/hr/attendance",
                icon: CalendarCheck,
                permission: "view_my_attendance",
            },
            {
                title: "My Payslips",
                href: "/dashboard/hr/payslips",
                icon: FileText,
                permission: "view_payroll",
            },
        ],
    },
    {
        title: "HR Admin",
        items: [
            {
                title: "Shifts",
                href: "/dashboard/hr/admin/shifts",
                icon: Clock,
                permission: "manage_shifts",
            },
            {
                title: "Employee Profiles",
                href: "/dashboard/hr/admin/employees",
                icon: Users,
                permission: "manage_employees",
            },
            {
                title: "Payroll",
                href: "/dashboard/hr/admin/payroll",
                icon: DollarSign,
                permission: "manage_payroll",
            },
            {
                title: "Leave Requests",
                href: "/dashboard/hr/admin/leaves",
                icon: CalendarOff,
                permission: "manage_hr",
            },
            {
                title: "Manual Transactions",
                href: "/dashboard/hr/admin/manual-transactions",
                icon: ArrowLeftRight,
                permission: "manage_payroll",
            },
            {
                title: "HR Settings",
                href: "/dashboard/hr/admin/settings",
                icon: SlidersHorizontal,
                permission: "manage_payroll",
            },
        ],
    },
    {
        title: "Finance",
        items: [
            {
                title: "Invoices",
                href: "/dashboard/finance/invoices",
                icon: Receipt,
                permission: "manage_invoices",
            },
            {
                title: "Subscriptions",
                href: "/dashboard/finance/subscriptions",
                icon: CreditCard,
                permission: "manage_subscriptions",
            },
        ],
    },
    {
        title: "Calendar",
        items: [
            {
                title: "Master Calendar",
                href: "/dashboard/calendar",
                icon: CalendarDays,
                permission: "view_calendar",
            },
        ],
    },
    {
        title: "Administration",
        items: [
            {
                title: "Users",
                href: "/dashboard/users",
                icon: UserCog,
                permission: "manage_users",
            },
            {
                title: "Roles & Permissions",
                href: "/dashboard/roles",
                icon: Shield,
                permission: "manage_roles",
            },
            {
                title: "Manage SOPs",
                href: "/dashboard/admin/sops",
                icon: ClipboardList,
                permission: "manage_sops",
            },
            {
                title: "Settings",
                href: "/dashboard/settings",
                icon: Settings,
                permission: "view_settings",
            },
        ],
    },
];
