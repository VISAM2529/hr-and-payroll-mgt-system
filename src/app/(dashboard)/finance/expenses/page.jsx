"use client";

import ExpenseManager from "@/components/finance/expense-manager";
import { useSession } from "@/context/SessionContext";

export default function ExpensesPage() {
    const { user } = useSession();

    return (
        <div className="p-4 md:p-8">
            <ExpenseManager
                employeeId={user?._id}
                isAdmin={user?.role === 'admin'}
            />
        </div>
    );
}
