/**
 * PF and ESIC Calculation Engine
 * Handles statutory compliance logic for India.
 */

// Statutory Constants (can be moved to DB/Config later)
const PF_CONFIG = {
    EMPLOYEE_RATE: 0.12,
    EMPLOYER_EPS_RATE: 0.0833,
    EMPLOYER_EPF_RATE: 0.0367,
    WAGE_CEILING: 15000,
    ADMIN_CHARGES_RATE: 0.005,
    EDLI_RATE: 0.005,
};

const ESIC_CONFIG = {
    WAGE_CEILING: 21000,
    EMPLOYEE_RATE: 0.0075,
    EMPLOYER_RATE: 0.0325,
};

/**
 * Calculate Provident Fund (PF)
 * @param {number} basicSalary - Monthly Basic Salary
 * @param {boolean} isPfApplicable - Is employee opted for PF?
 * @param {boolean} restrictToCeiling - If true, cap calculation at ₹15,000
 * @returns {Object} PF Breakdown
 */
export const calculatePF = (basicSalary, isPfApplicable, restrictToCeiling = true) => {
    if (!isPfApplicable) {
        return { employeeShare: 0, employerShare: { epf: 0, eps: 0 }, total: 0 };
    }

    // Determine wage for calculation
    const wage = (restrictToCeiling && basicSalary > PF_CONFIG.WAGE_CEILING)
        ? PF_CONFIG.WAGE_CEILING
        : basicSalary;

    const employeeShare = Math.round(wage * PF_CONFIG.EMPLOYEE_RATE);

    // Employer Split
    const eps = Math.round(wage * PF_CONFIG.EMPLOYER_EPS_RATE);
    const epf = Math.round(wage * PF_CONFIG.EMPLOYER_EPF_RATE); // Balancing figure usually, but simplest rule here
    // Note: Actual EPS is capped at 15000 always. 
    // If basic > 15000 and voluntary PF is there, specific rules apply. 
    // For standard SaaS:
    const employerTotal = Math.round(wage * 0.12);
    const actualEps = Math.min(Math.round(wage * PF_CONFIG.EMPLOYER_EPS_RATE), Math.round(PF_CONFIG.WAGE_CEILING * PF_CONFIG.EMPLOYER_EPS_RATE));
    const actualEpf = employerTotal - actualEps;

    return {
        employeeShare, // Deducted from salary
        employerShare: {
            epf: actualEpf,
            eps: actualEps,
            total: employerTotal
        }
    };
};

/**
 * Calculate ESIC
 * @param {number} grossSalary - Monthly Gross Salary
 * @param {boolean} isEsicApplicable - Explicit override
 * @returns {Object} ESIC Breakdown
 */
export const calculateESIC = (grossSalary, isEsicApplicable = true) => {
    // Check Eligibility
    if (!isEsicApplicable || grossSalary > ESIC_CONFIG.WAGE_CEILING) {
        return { employeeShare: 0, employerShare: 0, eligible: false };
    }

    // ESIC is on Gross, rounded to next rupee usually, but standard round works for estimation
    // Official rule: rounded to next higher rupee.
    const employeeShare = Math.ceil(grossSalary * ESIC_CONFIG.EMPLOYEE_RATE);
    const employerShare = Math.ceil(grossSalary * ESIC_CONFIG.EMPLOYER_RATE);

    return {
        eligible: true,
        employeeShare,
        employerShare
    };
};

/**
 * Detect Eligibility based on components
 * @param {Object} salaryStructure 
 */
export const detectComplianceEligibility = (salaryStructure) => {
    const { basic, gross } = salaryStructure;

    return {
        pfEligible: basic <= PF_CONFIG.WAGE_CEILING, // Strictly mandated if <= 15k
        esicEligible: gross <= ESIC_CONFIG.WAGE_CEILING
    };
};
