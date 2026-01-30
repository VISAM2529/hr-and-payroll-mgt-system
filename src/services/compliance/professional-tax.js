/**
 * Professional Tax Calculation Engine
 * Supports major Indian states.
 */

const PT_SLABS = {
    // Maharashtra
    'Maharashtra': (gross, gender) => {
        if (gross <= 7500) return 0;
        if (gross <= 10000) return 175;
        // 200 for all months, 300 for Feb
        const currentMonth = new Date().getMonth(); // 0 = Jan, 1 = Feb
        return (currentMonth === 1) ? 300 : 200;
    },

    // Karnataka
    'Karnataka': (gross) => {
        if (gross >= 15000) return 200;
        return 0;
    },

    // Tamil Nadu (Half yearly usually, but monthly equivalent often used in payroll software or deducted every 6 months)
    // Implementing standard monthly deduction approximation or 0 if not applicable monthly
    'Tamil Nadu': (gross) => {
        // TN PT is usually deducted in Sept and March.
        // For simplicity in monthly payroll, some orgs trust deducted monthly, but legal is half-yearly.
        // Let's return 0 and assume manual injection or config for now, OR implement the slab for the specific months.
        const month = new Date().getMonth();
        if (month === 2 || month === 8) { // Mar or Sep
            if (gross <= 21000) return 0;
            if (gross <= 30000) return 135;
            if (gross <= 45000) return 315;
            if (gross <= 60000) return 690;
            if (gross <= 75000) return 1025;
            return 1250;
        }
        return 0;
    },

    // West Bengal
    'West Bengal': (gross) => {
        if (gross <= 10000) return 0;
        if (gross <= 15000) return 110;
        if (gross <= 25000) return 130;
        if (gross <= 40000) return 150;
        return 200;
    },

    // Telangana / AP
    'Telangana': (gross) => {
        if (gross <= 15000) return 0;
        if (gross <= 20000) return 150;
        return 200;
    },

    // Gujarat
    'Gujarat': (gross) => {
        if (gross <= 12000) return 0;
        return 200; // Simplified, actual slabs vary slightly by notification
    },

    'Delhi': () => 0, // No PT in Delhi
    'Haryana': () => 0, // No PT in Haryana
};

/**
 * Calculate Professional Tax
 * @param {string} state - State Name
 * @param {number} grossSalary - Monthly Gross
 * @param {string} gender - 'Male' or 'Female' (relevant for some old rules, mostly unified now)
 * @returns {number} PT Amount
 */
export const calculatePT = (state, grossSalary, gender = 'Male') => {
    const calculator = PT_SLABS[state];
    if (!calculator) return 0; // default to 0 if state not found

    return calculator(grossSalary, gender);
};
