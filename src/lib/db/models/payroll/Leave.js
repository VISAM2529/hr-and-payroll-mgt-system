// src/lib/db/models/payroll/Leave.js
import mongoose from "mongoose";

const DEFAULT_USER_ID = new mongoose.Types.ObjectId("66e2f79f3b8d2e1f1a9d9c33");

// Individual leave entry schema
const leaveEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["Paid", "Unpaid", "Half-Day Paid", "Half-Day Unpaid"],
    required: true,
  },
  reason: {
    type: String,
    default: "",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: DEFAULT_USER_ID,
  },
  approvedAt: {
    type: Date,
    default: Date.now,
  },
});

// Monthly leave summary schema
const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeCode: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
      default: null,
    },
    organizationType: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    
    // Month and Year tracking
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    
    // Leave entries for the month
    leaves: [leaveEntrySchema],
    
    // Monthly summary (auto-calculated)
    summary: {
      totalDays: {
        type: Number,
        default: 0,
      },
      paidLeaves: {
        type: Number,
        default: 0,
      },
      unpaidLeaves: {
        type: Number,
        default: 0,
      },
      halfDayPaidLeaves: {
        type: Number,
        default: 0,
      },
      halfDayUnpaidLeaves: {
        type: Number,
        default: 0,
      },
    },
    
    // Annual leave balance - ANNUAL QUOTA SYSTEM (e.g., 31 days for whole year)
    annualLeaveBalance: {
      totalEntitled: {
        type: Number,
        default: 31, // Total leaves for the ENTIRE YEAR (not per month)
      },
      used: {
        type: Number,
        default: 0, // Total unpaid leaves used from Jan 1st to end of this month
      },
      remaining: {
        type: Number,
        default: 31, // Remaining annual quota at END of this month
      },
      balanceAtMonthStart: {
        type: Number,
        default: 31, // Remaining annual quota at START of this month (before this month's leaves)
      },
      thisMonthUnpaid: {
        type: Number,
        default: 0, // Unpaid leaves taken in this specific month only
      },
    },
    
    status: {
      type: String,
      enum: ["Draft", "Approved", "Rejected"],
      default: "Draft",
    },
    
    notes: {
      type: String,
      default: "",
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: DEFAULT_USER_ID,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: DEFAULT_USER_ID,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique month-year per employee
leaveSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
leaveSchema.index({ organizationId: 1 });
leaveSchema.index({ organizationType: 1 });
leaveSchema.index({ month: 1, year: 1 });
leaveSchema.index({ employeeCode: 1 });
leaveSchema.index({ status: 1 });

// Method to calculate monthly summary
leaveSchema.methods.calculateSummary = function () {
  let totalDays = 0;
  let paidLeaves = 0;
  let unpaidLeaves = 0;
  let halfDayPaidLeaves = 0;
  let halfDayUnpaidLeaves = 0;

  this.leaves.forEach((leave) => {
    if (leave.leaveType === "Paid") {
      paidLeaves += 1;
      totalDays += 1;
    } else if (leave.leaveType === "Unpaid") {
      unpaidLeaves += 1;
      totalDays += 1;
    } else if (leave.leaveType === "Half-Day Paid") {
      halfDayPaidLeaves += 1;
      totalDays += 0.5;
    } else if (leave.leaveType === "Half-Day Unpaid") {
      halfDayUnpaidLeaves += 1;
      totalDays += 0.5;
    }
  });

  this.summary = {
    totalDays,
    paidLeaves,
    unpaidLeaves,
    halfDayPaidLeaves,
    halfDayUnpaidLeaves,
  };

  // Calculate this month's unpaid leaves
  const thisMonthUnpaid = unpaidLeaves + (halfDayUnpaidLeaves * 0.5);
  this.annualLeaveBalance.thisMonthUnpaid = thisMonthUnpaid;

  return this.summary;
};

// Method to update annual leave balance
// This recalculates balance for ALL records of this employee in this year
leaveSchema.methods.updateAnnualBalance = async function () {
  try {
    const Leave = mongoose.model("Leave");
    
    // Get employee's total entitled leaves (from employee record or default 31)
    const Employee = mongoose.model("Employee");
    const employee = await Employee.findById(this.employeeId);
    const totalEntitled = employee?.totalLeaveEntitled || 
                         employee?.annualLeaveBalance || 
                         employee?.payslipStructure?.totalLeaveEntitled || 
                         31;
    
    // Get all leave records for this employee in this year, sorted by month
    const allYearLeaves = await Leave.find({
      employeeId: this.employeeId,
      year: this.year,
    }).sort({ month: 1 }); // Sort by month ascending
    
    console.log(`📊 Recalculating balances for employee ${this.employeeCode} in ${this.year}`);
    console.log(`   Total entitled: ${totalEntitled}`);
    console.log(`   Found ${allYearLeaves.length} month records`);
    
    // Process each month in order
    let cumulativeUnpaid = 0;
    
    for (const monthRecord of allYearLeaves) {
      // Calculate unpaid for this specific month
      const thisMonthUnpaid = (monthRecord.summary.unpaidLeaves || 0) + 
                             ((monthRecord.summary.halfDayUnpaidLeaves || 0) * 0.5);
      
      // Balance at START of this month (before this month's leaves)
      const balanceAtMonthStart = totalEntitled - cumulativeUnpaid;
      
      // Add this month's unpaid to cumulative
      cumulativeUnpaid += thisMonthUnpaid;
      
      // Balance at END of this month (after this month's leaves)
      const balanceAtMonthEnd = totalEntitled - cumulativeUnpaid;
      
      // Update this month's record
      monthRecord.annualLeaveBalance = {
        totalEntitled: totalEntitled,
        used: cumulativeUnpaid, // Total used till end of this month
        remaining: balanceAtMonthEnd, // Balance at END of this month
        balanceAtMonthStart: balanceAtMonthStart, // Balance at START of this month
        thisMonthUnpaid: thisMonthUnpaid, // Unpaid in this month only
      };
      
      await monthRecord.save();
      
      console.log(`   Month ${monthRecord.month}: Start=${balanceAtMonthStart}, Used=${thisMonthUnpaid}, End=${balanceAtMonthEnd}`);
    }
    
    console.log(`   ✅ Updated ${allYearLeaves.length} month records`);
    console.log(`   Final cumulative unpaid: ${cumulativeUnpaid}, Remaining: ${totalEntitled - cumulativeUnpaid}`);

    return this.annualLeaveBalance;
  } catch (error) {
    console.error("❌ Error updating annual balance:", error);
    throw error;
  }
};

// Pre-save middleware to calculate summary
leaveSchema.pre("save", function (next) {
  this.calculateSummary();
  next();
});

// Delete existing model to avoid conflicts
delete mongoose.models.Leave;

export default mongoose.models.Leave || mongoose.model("Leave", leaveSchema);