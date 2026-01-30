require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models (Adjust paths as needed)
// NOTE: Since these are in src/lib/db/models and use ES6 exports syntax in Next.js, 
// we might face issues running this directly with node if we don't handle imports correctly.
// A safer bet for a standalone script is to define schemas inline or use require if possible.
// However, assuming standard Mongoose models, let's try to require them. 
// IF that fails, we will define minimal schemas here for seeding.

// For robustness in this script, I will define the schemas/models minimally here 
// to avoid dependency/transpilation issues with the Next.js app structure.

const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
};

const seedData = async () => {
    await connectDB();

    console.log("Clearing existing data...");
    // Clear collections
    const collections = mongoose.connection.collections;
    // Clear collections explicitly for models used in seeding

    console.log("Seeding Users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create Users (Admin, Supervisor, Employee)
    const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String, employeeId: String }, { timestamps: true });
    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    await User.deleteMany({}); // Explicit clear

    const adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin"
    });

    const supervisorUser = await User.create({
        name: "Supervisor User",
        email: "supervisor@example.com",
        password: hashedPassword,
        role: "supervisor"
    });

    const employeeUser = await User.create({
        name: "John Employee",
        email: "employee@example.com",
        password: hashedPassword,
        role: "employee",
        employeeId: "EMP001"
    });

    console.log("Seeding Employees...");
    // Minimal Employee Schema for Demo
    const EmployeeSchema = new mongoose.Schema({
        employeeId: String,
        password: String, // Added password for login
        status: String,
        personalDetails: {
            firstName: String, lastName: String, email: String, phone: String,
            dateOfJoining: Date, gender: String, address: Object
        },
        jobDetails: {
            designation: String, department: String, location: String,
            organization: String,
            organizationId: mongoose.Schema.Types.ObjectId, // Fixed type
            employmentType: String
        },
        reportingManager: String,
        salaryDetails: Object,
        payslipStructure: Object, // Renamed from salaryStructure in seed to match model
        workingHr: { type: Number, default: 9 }
    }, { timestamps: true });
    const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
    await Employee.deleteMany({});

    const demoEmployees = [
        {
            firstName: "John", lastName: "Doe", email: "john@example.com", employeeId: "EMP001",
            designation: "Senior Developer", department: "Engineering",
            dateOfJoining: new Date("2023-01-15"), employmentStatus: "Active",
            personal: { phone: "9876543210", gender: "Male" },
            salary: { ctc: 1800000, basic: 75000, hra: 30000, specialAllowance: 45000 }
        },
        {
            firstName: "Sarah", lastName: "Smith", email: "sarah@example.com", employeeId: "EMP002",
            designation: "Product Designer", department: "Design",
            dateOfJoining: new Date("2023-03-10"), employmentStatus: "Active",
            personal: { phone: "9876543211", gender: "Female" },
            salary: { ctc: 1500000, basic: 62500, hra: 25000, specialAllowance: 37500 }
        },
        {
            firstName: "Mike", lastName: "Johnson", email: "mike@example.com", employeeId: "EMP003",
            designation: "Project Manager", department: "Product",
            dateOfJoining: new Date("2022-11-05"), employmentStatus: "Active",
            personal: { phone: "9876543212", gender: "Male" },
            salary: { ctc: 2400000, basic: 100000, hra: 40000, specialAllowance: 60000 }
        },
        {
            firstName: "Emily", lastName: "Davis", email: "emily@example.com", employeeId: "EMP004",
            designation: "HR Executive", department: "Human Resources",
            dateOfJoining: new Date("2024-01-20"), employmentStatus: "Active",
            personal: { phone: "9876543213", gender: "Female" },
            salary: { ctc: 900000, basic: 37500, hra: 15000, specialAllowance: 22500 }
        },
        {
            firstName: "David", lastName: "Wilson", email: "david@example.com", employeeId: "EMP005",
            designation: "Marketing Specialist", department: "Marketing",
            dateOfJoining: new Date("2023-06-15"), employmentStatus: "Active",
            personal: { phone: "9876543214", gender: "Male" },
            salary: { ctc: 1100000, basic: 45833, hra: 18333, specialAllowance: 27500 }
        }
    ];

    for (const emp of demoEmployees) {
        await Employee.create({
            employeeId: emp.employeeId,
            password: hashedPassword, // Use the same hashed password as users
            status: emp.employmentStatus,
            reportingManager: supervisorUser._id,
            personalDetails: {
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                phone: emp.personal.phone,
                gender: emp.personal.gender,
                dateOfJoining: emp.dateOfJoining
            },
            jobDetails: {
                designation: emp.designation,
                department: emp.department,
                location: "Mumbai", // Default for demo
                organization: "Synture Tech", // Default
                organizationId: "66e2f79f3b8d2e1f1a9d9c33", // Matched with PayrollRun
                employmentType: "Full-Time"
            },
            salaryDetails: {
                bankAccount: {
                    accountName: `${emp.firstName} ${emp.lastName}`,
                    accountNumber: `ACC${Math.floor(Math.random() * 1000000000)}`,
                    bankName: "HDFC Bank",
                    ifscCode: "HDFC0001234"
                }
            },
            payslipStructure: { // Matching model field name
                basicSalary: emp.salary.basic,
                grossSalary: emp.salary.ctc / 12, // Approx monthly gross
                earnings: [
                    { name: "HRA", calculationType: "fixed", fixedAmount: emp.salary.hra, enabled: true },
                    { name: "Special Allowance", calculationType: "fixed", fixedAmount: emp.salary.specialAllowance, enabled: true }
                ],
                deductions: []
            },
            workingHr: 9
        });
    }


    console.log("Seeding Investment Declarations...");
    const InvestmentDeclarationSchema = new mongoose.Schema({
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        financialYear: String,
        status: String,
        sections: Object,
        actualSubmissions: [
            {
                fileName: String,
                fileUrl: String,
                category: String,
                amount: Number,
                submittedDate: Date,
                status: String,
                remarks: String
            }
        ],
        remarks: String,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedDate: Date
    }, { timestamps: true });

    // Create constraint index if needed, but for seed we might skip or ensure uniqueness manually
    // investmentDeclarationSchema.index({ employeeId: 1, financialYear: 1 }, { unique: true });

    const InvestmentDeclaration = mongoose.models.InvestmentDeclaration || mongoose.model("InvestmentDeclaration", InvestmentDeclarationSchema);
    await InvestmentDeclaration.deleteMany({});

    // Seed declarations for a few employees
    const employees = await Employee.find({});

    for (const emp of employees) {
        // Skip some to simulate not everyone having submitted
        if (emp.employeeId === 'EMP005') continue;

        await InvestmentDeclaration.create({
            employeeId: emp._id,
            financialYear: "2025-26", // Matched with Frontend default
            status: emp.employeeId === 'EMP001' ? 'Pending' : (emp.employeeId === 'EMP002' ? 'Approved' : 'Draft'),
            sections: {
                section80C: {
                    ppf: 50000,
                    elss: 25000,
                    lic: 15000,
                    total: 90000
                },
                section80D: {
                    mediclaimSelf: 12000,
                    total: 12000
                },
                hra: {
                    annualRent: 180000,
                    landlordPan: "ABCDE1234F",
                    city: "Metro"
                },
                otherDeductions: {
                    standardDeduction: 50000,
                    professionalTax: 2500
                }
            },
            actualSubmissions: [
                {
                    fileName: "lic_receipt.pdf",
                    fileUrl: "/uploads/lic_receipt.pdf",
                    category: "LIC",
                    amount: 15000,
                    submittedDate: new Date(),
                    status: "Pending"
                },
                {
                    fileName: "rent_receipt_jan.pdf",
                    fileUrl: "/uploads/rent_receipt_jan.pdf",
                    category: "Rent Receipt",
                    amount: 15000,
                    submittedDate: new Date(),
                    status: "Verified"
                }
            ]
        });
    }



    console.log("Seeding Organizations...");
    const OrganizationSchema = new mongoose.Schema({
        name: String, email: String, status: String
    }, { timestamps: true });
    // IMPORTANT: Use the exact ID that is referenced in employees
    const Organization = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
    await Organization.deleteMany({});

    await Organization.create({
        _id: "66e2f79f3b8d2e1f1a9d9c33",
        name: "Synture Tech",
        email: "hr@synturetech.com",
        status: "Active"
    });

    console.log("Seeding Payroll Runs...");
    const PayrollRunSchema = new mongoose.Schema({
        runId: String, month: Number, year: Number, status: String, totalPayout: Number, totalEmployees: Number, totalGrossSalary: Number, totalNetSalary: Number, processedEmployees: Number, organizationId: Object, generatedBy: Object
    }, { timestamps: true });
    const PayrollRun = mongoose.models.PayrollRun || mongoose.model("PayrollRun", PayrollRunSchema);
    await PayrollRun.deleteMany({});

    await PayrollRun.create({
        runId: "PAY-JAN-2025",
        month: 1,
        year: 2025,
        status: "Completed",
        totalPayout: 4250000,
        totalEmployees: 45,
        totalGrossSalary: 4800000,
        totalNetSalary: 4250000,
        processedEmployees: 45,
        organizationId: "66e2f79f3b8d2e1f1a9d9c33", // Placeholder
        generatedBy: adminUser._id
    });

    console.log("Seeding Payslips...");
    const PayslipSchema = new mongoose.Schema({
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        payslipId: String,
        month: Number,
        year: Number,
        basicSalary: Number,
        grossSalary: Number,
        netSalary: Number,
        totalDeductions: Number,
        earnings: Array,
        deductions: Array,
        organizationName: String,
        salaryType: String,
        status: String,
        generatedBy: Object,
        workingDays: Number,
        presentDays: Number,
        isPFApplicable: Boolean,
        isESICApplicable: Boolean,
        isPTApplicable: Boolean
    }, { timestamps: true });

    const Payslip = mongoose.models.Payslip || mongoose.model("Payslip", PayslipSchema);
    await Payslip.deleteMany({});

    let slipCount = 1;
    for (const emp of employees) {
        const basic = emp.baseSalary || 25000;
        const gross = emp.salaryDetails?.ctc / 12 || basic * 2;
        const deductions = gross * 0.1;
        const net = gross - deductions;

        await Payslip.create({
            employee: emp._id,
            payslipId: `PSL${String(slipCount++).padStart(6, '0')}`,
            month: 4, // April 2025 (FY 2025-26)
            year: 2025,
            basicSalary: basic,
            // ... rest of object
            grossSalary: gross,
            netSalary: net,
            totalDeductions: deductions,
            earnings: [
                { type: 'Basic Salary', amount: basic },
                { type: 'HRA', amount: basic * 0.4 },
                { type: 'Special Allowance', amount: gross - (basic * 1.4) }
            ],
            deductions: [
                { type: 'PF', amount: 1800 },
                { type: 'Professional Tax', amount: 200 }
            ],
            organizationName: "Acme Corp",
            salaryType: "monthly",
            status: "Generated",
            generatedBy: adminUser._id,
            workingDays: 30, // April has 30 days
            presentDays: 30,
            isPFApplicable: true,
            isESICApplicable: false,
            isPTApplicable: true
        });
    }



    console.log("Seeding Performance Appraisals...");
    const AppraisalSchema = new mongoose.Schema({
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        period: String,
        status: String,
        startDate: Date,
        endDate: Date
    }, { timestamps: true });

    // appraisalSchema.index({ employee: 1, period: 1 }, { unique: true });

    const Appraisal = mongoose.models.Appraisal || mongoose.model("Appraisal", AppraisalSchema);
    await Appraisal.deleteMany({});

    // Seed appraisals for a few employees
    for (const emp of employees) {
        if (emp.employeeId === 'EMP005') continue;

        await Appraisal.create({
            employee: emp._id,
            manager: supervisorUser._id,
            period: "2024-Q4",
            status: emp.employeeId === 'EMP001' ? 'In-Review' : (emp.employeeId === 'EMP002' ? 'Completed' : 'Self-Appraisal'),
            startDate: new Date("2024-10-01"),
            endDate: new Date("2024-12-31")
        });
    }

    console.log("Seeding Announcements...");
    const AnnouncementSchema = new mongoose.Schema({
        title: String, content: String, type: String, priority: String, createdBy: Object, targetAudience: Object
    }, { timestamps: true });
    const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
    await Announcement.deleteMany({});

    await Announcement.create({
        title: "Annual Company Retreat 2025",
        content: "We are excited to announce our annual retreat! Join us in Goa for a weekend of fun and team building.",
        type: "Announcement",
        priority: "Normal",
        createdBy: { name: "HR Team" },
        targetAudience: { all: true }
    });

    await Announcement.create({
        title: "New Remote Work Policy",
        content: "Effective immediately, employees can work remotely up to 3 days a week. Please verify with your manager.",
        type: "Policy",
        priority: "High",
        createdBy: { name: "HR Team" },
        targetAudience: { all: true }
    });

    console.log("Seeding Recruitment Data...");
    const JobRequisitionSchema = new mongoose.Schema({
        title: String, department: String, status: String, location: String, employmentType: String, priority: String
    }, { timestamps: true });
    const JobRequisition = mongoose.models.JobRequisition || mongoose.model("JobRequisition", JobRequisitionSchema);
    await JobRequisition.deleteMany({});

    await JobRequisition.create({
        title: "Senior Product Designer",
        department: "Design",
        status: "Open",
        location: "Mumbai",
        employmentType: "Full-time",
        priority: "High"
    });

    await JobRequisition.create({
        title: "React Native Developer",
        department: "Engineering",
        status: "Interviewing",
        location: "Remote",
        employmentType: "Full-time",
        priority: "Medium"
    });



    console.log("Seeding Onboarding Checklists...");
    const OnboardingChecklistSchema = new mongoose.Schema({
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        tasks: [{
            category: String,
            task: String,
            status: String,
            dueDate: Date,
            completedAt: Date,
            assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
            notes: String
        }],
        status: String,
        startedAt: Date,
        completedAt: Date
    }, { timestamps: true });

    const OnboardingChecklist = mongoose.models.OnboardingChecklist || mongoose.model("OnboardingChecklist", OnboardingChecklistSchema);
    await OnboardingChecklist.deleteMany({});

    for (const emp of employees) {
        // Skip some to vary data
        if (emp.employeeId === 'EMP005') continue;

        const isCompleted = emp.employeeId === 'EMP002'; // Sarah is completed

        const doj = emp.personalDetails.dateOfJoining;

        await OnboardingChecklist.create({
            employee: emp._id,
            status: isCompleted ? 'Completed' : 'In Progress',
            startedAt: doj,
            completedAt: isCompleted ? new Date(doj.getTime() + 86400000 * 7) : undefined,
            tasks: [
                {
                    category: 'Documentation',
                    task: 'Submit Aadhar & PAN',
                    status: 'Completed',
                    dueDate: new Date(doj.getTime() + 86400000 * 2),
                    completedAt: new Date(doj.getTime() + 86400000),
                    assignedTo: emp._id
                },
                {
                    category: 'IT Setup',
                    task: 'Receive Laptop & Peripherals',
                    status: isCompleted ? 'Completed' : 'Pending',
                    dueDate: new Date(doj.getTime() + 86400000),
                    completedAt: isCompleted ? new Date(doj.getTime()) : undefined,
                    assignedTo: supervisorUser._id
                },
                {
                    category: 'Finance',
                    task: 'Bank Account Setup',
                    status: 'Completed',
                    dueDate: new Date(doj.getTime() + 86400000 * 5),
                    completedAt: new Date(doj.getTime() + 86400000 * 3),
                    assignedTo: emp._id
                }
            ]
        });
    }

    console.log("Seeding Finance Data...");
    // Ledger Entry Schema
    const LedgerEntrySchema = new mongoose.Schema({
        date: Date, referenceNumber: String, description: String, source: String, totalDebit: Number, totalCredit: Number, lines: Array
    }, { timestamps: true });
    const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model("LedgerEntry", LedgerEntrySchema);
    await LedgerEntry.deleteMany({});

    await LedgerEntry.create({
        date: new Date(),
        referenceNumber: "PAY-JAN-2025",
        description: "January 2025 Payroll Processing",
        source: "Payroll",
        totalDebit: 4250000,
        totalCredit: 4250000,
        lines: [
            { accountName: "Salaries Expense", accountType: "Expense", debit: 4250000, credit: 0 },
            { accountName: "Bank Account", accountType: "Asset", debit: 0, credit: 4250000 }
        ]
    });

    await LedgerEntry.create({
        date: new Date(Date.now() - 86400000 * 5), // 5 days ago
        referenceNumber: "INV-2025-001",
        description: "Office Rent Payment",
        source: "Accounts Payable",
        totalDebit: 150000,
        totalCredit: 150000,
        lines: [
            { accountName: "Rent Expense", accountType: "Expense", debit: 150000, credit: 0 },
            { accountName: "Bank Account", accountType: "Asset", debit: 0, credit: 150000 }
        ]
    });

    console.log("Database Seeded Successfully!");
    process.exit(0);
};

seedData().catch(err => {
    console.error("Seeding Failed:", err);
    process.exit(1);
});
