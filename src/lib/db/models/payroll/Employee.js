import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { calculatePF, calculateESIC } from "@/services/compliance/pf-esic";
import { calculatePT } from "@/services/compliance/professional-tax";


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
      businessUnitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusinessUnit",
        required: false,
        default: null,
      },
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: false,
        default: null,
      },
      costCenterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CostCenter",
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
employeeSchema.methods.calculateSalaryComponents = function (params = {}) {
  const { workingDaysInMonth = 26, presentDays = null, lopDays = 0, month = null } = params;

  const structure = this.payslipStructure;
  if (!structure) {
    throw new Error("Salary structure (payslipStructure) is missing for this employee.");
  }

  const standardBasic = structure.basicSalary || 0;

  let basicSalary = standardBasic;
  let lopAmount = 0;

  // Calculate LOP (Loss of Pay) if applicable
  if (lopDays > 0 && workingDaysInMonth > 0 && standardBasic > 0) {
    lopAmount = (standardBasic / workingDaysInMonth) * lopDays;
    basicSalary = Math.max(0, standardBasic - lopAmount);
  }

  // Calculate earnings based on the actual basic salary
  const earnings = structure.earnings || [];
  const calculatedEarnings = earnings
    .filter(e => e.enabled)
    .map(earning => {
      let amount = 0;
      if (earning.calculationType === 'percentage') {
        amount = (basicSalary * (earning.percentage || 0)) / 100;
      } else {
        amount = earning.fixedAmount || 0;
      }
      return {
        ...earning.toObject(),
        calculatedAmount: Math.round(amount)
      };
    });

  // Calculate Gross Salary (Actual Basic + Earnings)
  const grossSalary = basicSalary + calculatedEarnings.reduce((sum, e) => sum + e.calculatedAmount, 0);

  // Calculate configured deductions
  const deductions = structure.deductions || [];
  let calculatedDeductions = deductions
    .filter(d => d.enabled)
    .map(deduction => {
      let amount = 0;
      if (deduction.calculationType === 'percentage') {
        amount = (basicSalary * (deduction.percentage || 0)) / 100;
      } else {
        amount = deduction.fixedAmount || 0;
      }
      return {
        ...deduction.toObject(),
        calculatedAmount: Math.round(amount)
      };
    });

  // Add LOP as a deduction if it was calculated
  if (lopAmount > 0) {
    calculatedDeductions.push({
      name: 'Loss of Pay (LOP)',
      calculatedAmount: lopAmount,
      autoCalculated: true
    });
  }

  // ========== AUTO-CALCULATED STATUTORY DEDUCTIONS (India Compliance) ==========

  // 1. PF (Provident Fund)
  if (this.pfApplicable === 'yes') {
    const pfDetails = calculatePF(basicSalary, true); // true = check applicability (already checked by if)

    // Note: Service returns breakdown. We map it to the structure.
    calculatedDeductions.push({
      name: 'Provident Fund (PF)',
      calculatedAmount: pfDetails.employeeShare,
      autoCalculated: true,
      employerContribution: pfDetails.employerShare.total
    });
  }

  // 2. ESIC
  if (this.esicApplicable === 'yes') {
    const esicDetails = calculateESIC(grossSalary, true);

    if (esicDetails.eligible && esicDetails.employeeShare > 0) {
      calculatedDeductions.push({
        name: 'ESIC',
        calculatedAmount: esicDetails.employeeShare,
        autoCalculated: true,
        employerContribution: esicDetails.employerShare
      });
    }
  }

  // 3. Professional Tax (PT) - State-wise
  // Use work location state or fallback to Maharashtra
  const state = this.personalDetails?.address?.state || 'Maharashtra';
  const ptAmount = calculatePT(state, grossSalary, this.personalDetails?.gender || 'Male');

  if (ptAmount > 0) {
    calculatedDeductions.push({
      name: 'Professional Tax (PT)',
      calculatedAmount: ptAmount,
      autoCalculated: true
    });
  }

  // 4. TDS (Income Tax) - Placeholder logic for now
  // In a real system, this would use investment declarations and annual projections
  if (this.isTDSApplicable) {
    const annualGross = grossSalary * 12;
    let monthlyTDS = 0;
    if (annualGross > 700000) { // Simple 7L exemption logic for New Regime
      monthlyTDS = Math.round(((annualGross - 700000) * 0.1) / 12);
    }

    if (monthlyTDS > 0) {
      calculatedDeductions.push({
        name: 'Income Tax (TDS)',
        calculatedAmount: monthlyTDS,
        autoCalculated: true
      });
    }
  }

  // ============================================================================

  const totalEarnings = grossSalary;
  const totalDeductions = calculatedDeductions.reduce((sum, d) => sum + d.calculatedAmount, 0);
  const netSalary = Math.round(totalEarnings - totalDeductions);

  return {
    basicSalary,
    standardBasic,
    earnings: calculatedEarnings,
    deductions: calculatedDeductions,
    totalEarnings,
    totalDeductions,
    netSalary,
    salaryType: structure.salaryType,
    lopAmount
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