/**
 * Income Tax Regime Comparison Engine
 * Estimates tax liability under Old vs New Regime (FY 2024-25)
 */

// FY 2024-25 (AY 2025-26) Slabs
const NEW_REGIME_SLABS = [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 0.05 },
    { limit: 1000000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

const OLD_REGIME_SLABS = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 }
];

const REBATE_LIMIT_NEW = 700000; // Tax free if income <= 7L
const REBATE_LIMIT_OLD = 500000; // Tax free if income <= 5L
const STANDARD_DEDUCTION = 500000; // Common for simplicity? No, New Regime increased to 75k in budget 2024, Old is 50k.
// Budget 2024 Updates:
// New Regime Standard Deduction: 75,000
// Old Regime Standard Deduction: 50,000

const STD_DEDUCTION_NEW = 75000;
const STD_DEDUCTION_OLD = 50000;

function calculateTaxForSlabs(taxableIncome, slabs) {
    let tax = 0;
    let previousLimit = 0;

    for (const slab of slabs) {
        if (taxableIncome > previousLimit) {
            const taxableAmount = Math.min(taxableIncome, slab.limit) - previousLimit;
            tax += taxableAmount * slab.rate;
            previousLimit = slab.limit;
        } else {
            break;
        }
    }
    return tax;
}

/**
 * Calculate Tax Liability
 * @param {number} annualGross - Annual Gross Salary
 * @param {Object} exemptions - { section80C, section80D, hraExemption, lta, etc. }
 * @returns {Object} Comparison
 */
export const compareTaxRegimes = (annualGross, exemptions = {}) => {
    const {
        section80C = 0,
        section80D = 0,
        hraExemption = 0,
        otherExemptions = 0
    } = exemptions;

    // --- NEW REGIME CALCULATION ---
    // Deductions allowed: Standard Deduction (75k), Employer NPS (80CCD(2)) - ignored for basic calc
    const taxableIncomeNew = Math.max(0, annualGross - STD_DEDUCTION_NEW);

    let taxNew = 0;
    if (taxableIncomeNew <= REBATE_LIMIT_NEW) {
        taxNew = 0;
    } else {
        // Slabs: 0-3L: 0, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30% (Approx)
        // Budget 2024 changes: 0-3 Nil, 3-7 5%, 7-10 10%, 10-12 15%, 12-15 20%, >15 30%
        // Note: The Rebate u/s 87A makes it zero if taxable income <= 7L.
        // If >7L, calculation starts from slabs.
        // However, there is marginal relief. We will ignore marginal relief for MVP.

        // Using simple slab loop logic (need correct slabs for '24)
        // Adjusted slabs for '24 proposed:
        // 0-3: Nil
        // 3-7: 5%
        // 7-10: 10%
        // 10-12: 15%
        // 12-15: 20%
        // >15: 30%
        const currentNewSlabs = [
            { limit: 300000, rate: 0 },
            { limit: 700000, rate: 0.05 },
            { limit: 1000000, rate: 0.10 },
            { limit: 1200000, rate: 0.15 },
            { limit: 1500000, rate: 0.20 },
            { limit: Infinity, rate: 0.30 }
        ];
        taxNew = calculateTaxForSlabs(taxableIncomeNew, currentNewSlabs);
    }
    const cessNew = taxNew * 0.04;
    const totalTaxNew = taxNew + cessNew;


    // --- OLD REGIME CALCULATION ---
    // Deductions: 80C (up to 1.5L), 80D, HRA, Std Ded (50k)
    const totalDeductionsOld = Math.min(section80C, 150000) + section80D + hraExemption + otherExemptions + STD_DEDUCTION_OLD;
    const taxableIncomeOld = Math.max(0, annualGross - totalDeductionsOld);

    let taxOld = 0;
    if (taxableIncomeOld <= REBATE_LIMIT_OLD) {
        taxOld = 0;
    } else {
        taxOld = calculateTaxForSlabs(taxableIncomeOld, OLD_REGIME_SLABS);
    }
    const cessOld = taxOld * 0.04;
    const totalTaxOld = taxOld + cessOld;

    return {
        annualGross,
        oldRegime: {
            taxableIncome: taxableIncomeOld,
            tax: totalTaxOld,
            deductionsClaimed: totalDeductionsOld
        },
        newRegime: {
            taxableIncome: taxableIncomeNew,
            tax: totalTaxNew,
            deductionsClaimed: STD_DEDUCTION_NEW
        },
        betterRegime: totalTaxNew <= totalTaxOld ? 'New' : 'Old',
        savings: Math.abs(totalTaxNew - totalTaxOld)
    };
};
