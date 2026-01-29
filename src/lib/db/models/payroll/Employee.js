import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_USER_ID = "674e92d8ce08af0109923297"; // Default admin ID for system actions.

// Salary Structure Schemas (from Template)
const earningComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  calculationType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  fixedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

const deductionComponentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  calculationType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  fixedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

const payslipFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

// Employee's Personal Payslip Structure
const employeePayslipStructureSchema = new mongoose.Schema({
  salaryType: {
    type: String,
    enum: ['monthly', 'perday'],
    default: 'monthly',
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0,
  },
  earnings: [earningComponentSchema],
  deductions: [deductionComponentSchema],
  additionalFields: [payslipFieldSchema],
  // Computed fields
  totalEarnings: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    default: 0,
  },
  perDaySalary: {
    type: Number,
    default: 0,
  },
  grossSalary: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const bankAccountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  ifscCode: {
    type: String,
    required: true,
  },
  branch: String,
  branchAddress: String, // NEW FIELD
});

const documentSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  size: Number,
  category: String,
  categoryName: String,
  uploadDate: Date,
  url: String,
  cloudinaryId: String,
  cloudinaryUrl: String,
  thumbnail: String,
});

const attendanceApprovalSchema = new mongoose.Schema({
  required: {
    type: String,
    enum: ["yes", "no"],
    default: "no",
  },
  shift1Supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
    required: false,
  },
  shift2Supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
    required: false,
  },
});

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    // NEW FIELD: Password for login
    password: {
      type: String,
      select: false, // Do not return by default
    },
    // NEW FIELD: Role (Resticted Access)
    role: {
      type: String,
      enum: ["employee", "attendance_only", "admin"],
      default: "employee"
    },
    // NEW FIELD: Compliance Status
    isCompliant: {
      type: Boolean,
      default: false
    },
    // NEW FIELD: TDS Applicable
    isTDSApplicable: {
      type: Boolean,
      default: false
    },
    personalDetails: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phone: {
        type: String,
        required: true,
      },
      // NEW FIELD: Blood Group
      bloodGroup: String,
      // NEW FIELDS: Addresses
      address: { // Keeping for backward compatibility or as Current Address
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
      temporaryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
      permanentAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
      dateOfJoining: {
        type: Date,
        required: true,
      },
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
      },
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        address: String, // NEW FIELD
      },
    },
    jobDetails: {
      department: {
        type: String,
        required: true,
      },
      departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: false,
        default: null,
      },
      employeeType: String,
      employeeTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeType",
        required: false,
        default: null,
      },
      category: String,
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EmployeeCategory",
        required: false,
        default: null,
      },
      organization: String,
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: false,
        default: null,
      },
      designation: { // Employee Designation
        type: String,
        required: true,
      },
      reportingManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null,
        required: false,
      },
      // NEW FIELDS: Team Lead and Supervisor
      teamLead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null,
      },
      workLocation: String,
    },
    salaryDetails: {
      bankAccount: {
        accountNumber: { type: String, required: true },
        bankName: { type: String, required: true },
        ifscCode: { type: String, required: true },
        branch: String,
        branchAddress: String, // New Field
      },
      panNumber: String,
      aadharNumber: String,
    },

    // Employee's Personal Payslip Structure
    payslipStructure: {
      type: employeePayslipStructureSchema,
      required: true,
    },
    workingHr: {
      type: Number,
      required: true,
    },
    otApplicable: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    esicApplicable: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    pfApplicable: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    probation: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    isAttending: {
      type: String,
      enum: ["yes", "no"],
      default: "no",
    },
    attendanceApproval: {
      type: attendanceApprovalSchema,
      default: () => ({
        required: "no",
        shift1Supervisor: null,
        shift2Supervisor: null,
      }),
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Terminated"],
      default: "Active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      default: DEFAULT_USER_ID,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: DEFAULT_USER_ID,
    },
    sessionToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
employeeSchema.index({ 'jobDetails.department': 1 });
employeeSchema.index({ 'jobDetails.organizationId': 1 });
employeeSchema.index({ 'jobDetails.departmentId': 1 });
employeeSchema.index({ status: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.personalDetails.firstName} ${this.personalDetails.lastName}`;
});

// Method to calculate salary components
employeeSchema.methods.calculateSalaryComponents = function (workingDays = null) {
  const structure = this.payslipStructure;
  let basicSalary = structure.basicSalary;

  // Calculate basic salary based on salary type
  if (structure.salaryType === 'perday' && workingDays) {
    basicSalary = structure.basicSalary * workingDays;
  }

  // Calculate earnings
  const calculatedEarnings = structure.earnings
    .filter(e => e.enabled)
    .map(earning => {
      let amount = 0;
      if (earning.calculationType === 'percentage') {
        amount = (basicSalary * earning.percentage) / 100;
      } else {
        amount = earning.fixedAmount;
      }
      return {
        ...earning.toObject(),
        calculatedAmount: amount
      };
    });

  // Calculate Gross Salary (Basic + Warnings)
  const grossSalary = basicSalary + calculatedEarnings.reduce((sum, e) => sum + e.calculatedAmount, 0);

  // Calculate configured deductions
  let calculatedDeductions = structure.deductions
    .filter(d => d.enabled)
    .map(deduction => {
      let amount = 0;
      if (deduction.calculationType === 'percentage') {
        amount = (basicSalary * deduction.percentage) / 100;
      } else {
        amount = deduction.fixedAmount;
      }
      return {
        ...deduction.toObject(),
        calculatedAmount: amount
      };
    });

  // ========== AUTO-CALCULATED DEDUCTIONS (PF & ESIC) ==========
  // Check PF Applicability (On Basic)
  if (this.pfApplicable === 'yes') {
    // Check if PF is already being deducted (sent from frontend) to avoid double deduction
    const existingPF = calculatedDeductions.some(d =>
      d.name.toLowerCase().includes('provident fund') ||
      d.name.toLowerCase().includes('pf')
    );

    if (!existingPF) {
      const pfEmployee = (basicSalary * 12) / 100; // 12%
      const pfEmployer = (basicSalary * 13) / 100; // 13%

      calculatedDeductions.push({
        name: 'PF (Employee 12%)',
        calculatedAmount: pfEmployee,
        autoCalculated: true
      });
      calculatedDeductions.push({
        name: 'PF (Employer 13%)',
        calculatedAmount: pfEmployer,
        autoCalculated: true
      });
    }
  }

  // Check ESIC Applicability (On Gross) - Only if Gross <= 21000
  if (this.esicApplicable === 'yes') {
    // ESIC calculation usually depends on the "Wages" definition which often matches Gross in simpler setups.
    if (grossSalary <= 21000) {
      // Check if ESIC is already being deducted
      const existingESIC = calculatedDeductions.some(d =>
        d.name.toLowerCase().includes('esic') ||
        d.name.toLowerCase().includes('esi')
      );

      if (!existingESIC) {
        const esicEmployee = (grossSalary * 0.75) / 100; // 0.75%
        const esicEmployer = (grossSalary * 3.25) / 100; // 3.25%

        calculatedDeductions.push({
          name: 'ESIC (Employee 0.75%)',
          calculatedAmount: esicEmployee,
          autoCalculated: true
        });
        calculatedDeductions.push({
          name: 'ESIC (Employer 3.25%)',
          calculatedAmount: esicEmployer,
          autoCalculated: true
        });
      }
    }
  }
  // ============================================================

  const totalEarnings = grossSalary; // Gross is effectively Total Earnings here
  const totalDeductions = calculatedDeductions.reduce((sum, d) => sum + d.calculatedAmount, 0);
  const netSalary = totalEarnings - totalDeductions;

  return {
    basicSalary,
    earnings: calculatedEarnings,
    deductions: calculatedDeductions,
    totalEarnings,
    totalDeductions,
    netSalary,
    salaryType: structure.salaryType
  };
};

// Method to update computed salary fields
employeeSchema.methods.updateComputedSalary = function () {
  const calculated = this.calculateSalaryComponents();
  this.payslipStructure.totalEarnings = calculated.totalEarnings;
  // IMPORTANT: Don't overwrite grossSalary - it represents CTC entered by user
  // grossSalary is set by the form and should be preserved
  // this.payslipStructure.grossSalary remains as the user-entered CTC value
  this.payslipStructure.totalDeductions = calculated.totalDeductions;
  this.payslipStructure.netSalary = calculated.netSalary;
  if (this.payslipStructure.salaryType === 'perday') {
    this.payslipStructure.perDaySalary = this.payslipStructure.basicSalary;
  }
};

// Pre-save middleware
employeeSchema.pre('save', function (next) {
  if (!this.workingHr) {
    this.workingHr = 9;
  }

  // Update computed salary fields if payslip structure changed
  if (this.isModified('payslipStructure')) {
    this.updateComputedSalary();
  }

  // Hash password if modified
  if (this.isModified("password") && this.password) {
    this.password = bcrypt.hashSync(this.password, 10);
  }

  next();
});

// Method to compare password
employeeSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get JWT token
employeeSchema.methods.getJwtToken = function (role) {
  return jwt.sign({ id: this._id, role: role || this.role }, process.env.JWT_SECRET || "fallback_secret_key_change_me", {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};


// Delete existing model
if (mongoose.models.Employee) {
  delete mongoose.models.Employee;
}

export default mongoose.models.Employee || mongoose.model("Employee", employeeSchema);