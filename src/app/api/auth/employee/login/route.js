
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Employee from "@/lib/db/models/payroll/Employee";
import Organization from '@/lib/db/models/crm/organization/Organization';
import Department from '@/lib/db/models/crm/Department/department';
import EmployeeType from "@/lib/db/models/crm/employee/EmployeeType";
import EmployeeCategory from "@/lib/db/models/crm/employee/EmployeeCategory";
import EmployeeSubCategory from "@/lib/db/models/crm/employee/EmployeeSubCategory";
export async function POST(request) {
  try {
    await dbConnect();

    const { employeeId, password } = await request.json();

    if (!employeeId || !password) {
      return NextResponse.json(
        { error: "Please provide both Employee ID and password" },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId })
      .select('+password') // Explicitly include password as it's select: false
      .populate('jobDetails.reportingManager', 'personalDetails.firstName personalDetails.lastName employeeId')
      .populate('jobDetails.departmentId', 'departmentName')
      .populate('jobDetails.organizationId', 'name')
      .populate('jobDetails.employeeTypeId', 'employeeType')
      .populate('jobDetails.categoryId', 'employeeCategory');

    if (!employee) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await employee.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if employee is active
    if (employee.status !== 'Active') {
      return NextResponse.json(
        { error: "Your account is not active. Please contact HR." },
        { status: 403 }
      );
    }

    // Determine role based on category
    let role = 'employee';
    const categoryObj = employee.jobDetails?.categoryId;
    // Check populated category name or category string
    const categoryName = categoryObj?.employeeCategory || employee.jobDetails?.category;

    if (categoryName && categoryName.toLowerCase() === 'supervisor') {
      role = 'supervisor';
    }

    // Generate token
    const token = employee.getJwtToken(role);

    // Save token to employee session (optional, for server-side validity check)
    employee.sessionToken = token;
    await employee.save({ validateBeforeSave: false });

    // Remove password from response
    employee.password = undefined;

    // Create response
    const response = NextResponse.json({
      success: true,
      token,
      employee
    });

    // Set cookie
    response.cookies.set("employee_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
