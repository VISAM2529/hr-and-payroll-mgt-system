// // src/app/api/auth/login/route.js
// import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/db/connect';
// import User from '@/lib/db/models/User';
// import Employee from '@/lib/db/models/payroll/Employee';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET;
// const TOKEN_MAX_AGE = 2 * 60 * 60; // seconds (2 hours)

// export async function POST(req) {
//   try {
//     if (!JWT_SECRET) {
//       console.error('JWT_SECRET is not set');
//       return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
//     }

//     await dbConnect();

//     const body = await req.json();
//     const username = (body.username || '').toString().trim();
//     const password = (body.password || '').toString().trim();
//     const role = (body.role || '').toString().trim().toLowerCase();

//     console.log('Login attempt:', { username, role,password });

//     if (!username || !password || !role) {
//       return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
//     }

//     // --- ADMIN LOGIN ---
//     if (role === 'admin') {
//       const email = username.toLowerCase();

//       const user = await User.findOne({ email });
//       if (!user) {
//         return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
//       }

//       const isAdminUser = (user.role && user.role.toLowerCase() === 'admin') || 
//                           (user.department && user.department.toLowerCase() === 'admin');

//       if (!isAdminUser) {
//         return NextResponse.json({ message: 'Unauthorized for admin access' }, { status: 403 });
//       }

//       if (!user.password) {
//         return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
//       }

//       const token = jwt.sign(
//         { id: user._id.toString(), role: 'admin', department: 'admin' },
//         JWT_SECRET,
//         { expiresIn: TOKEN_MAX_AGE }
//       );

//       await User.updateOne(
//         { _id: user._id },
//         { $set: { sessionToken: token } }
//       );

//       const res = NextResponse.json({
//         user: {
//           id: user._id.toString(),
//           email: user.email,
//           role: 'admin',
//           department: 'admin'
//         }
//       });

//       res.cookies.set('authToken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         path: '/',
//         maxAge: TOKEN_MAX_AGE
//       });

//       console.log('Admin login success:', email);
//       return res;
//     }

//     // --- EMPLOYEE LOGIN (using Employee ID + DOB) ---
//     if (role === 'employee') {
//       // Find employee by employeeId
//       const employee = await Employee.findOne({ employeeId: username });
//       console.log('Employee lookup result:', employee);
//       if (!employee) {
//         return NextResponse.json({ message: 'Invalid Employee ID or Date of Birth' }, { status: 401 });
//       }
//       console.log('Found employee:', employee.employeeId);
//       // Get DOB and normalize to YYYY-MM-DD
//       const rawDob = employee.personalDetails?.dateOfBirth;
//       if (!rawDob) {
//         return NextResponse.json({ message: 'Employee DOB not available' }, { status: 500 });
//       }

//       const dobDate = new Date(rawDob);
//       if (isNaN(dobDate.getTime())) {
//         return NextResponse.json({ message: 'Employee DOB format invalid' }, { status: 500 });
//       }

//       const dobString = dobDate.toISOString().split('T')[0]; // YYYY-MM-DD

//       // Compare password (DOB)
//       if (dobString !== password) {
//         return NextResponse.json({ message: 'Invalid Employee ID or Date of Birth' }, { status: 401 });
//       }

//       // Create token with role as "employee"
//       const token = jwt.sign(
//         {
//           id: employee._id.toString(),
//           role: 'employee',
//           designation: employee.jobDetails.designation,
//           department: employee.jobDetails.department
//         },
//         JWT_SECRET,
//         { expiresIn: TOKEN_MAX_AGE }
//       );

//       // Update employee with sessionToken
//       await Employee.updateOne(
//         { _id: employee._id },
//         { $set: { sessionToken: token } }
//       );

//       const res = NextResponse.json({
//         user: {
//           id: employee._id.toString(),
//           email: employee.personalDetails.email,
//           role: 'employee',
//           designation: employee.jobDetails.designation,
//           department: employee.jobDetails.department,
//           personalDetails: {
//             firstName: employee.personalDetails.firstName,
//             lastName: employee.personalDetails.lastName
//           }
//         }
//       });

//       res.cookies.set('authToken', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         path: '/',
//         maxAge: TOKEN_MAX_AGE
//       });

//       console.log('Employee login success:', username);
//       return res;
//     }

//     return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
//   } catch (err) {
//     console.error('Login error:', err);
//     return NextResponse.json({ message: 'Server error: ' + err.message }, { status: 500 });
//   }
// }




// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import Employee from '@/lib/db/models/payroll/Employee';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logActivity } from '@/lib/logger';
import EmployeeType from '@/lib/db/models/crm/employee/EmployeeType';
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_MAX_AGE = 2 * 60 * 60; // seconds (2 hours)

export async function POST(req) {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    await dbConnect();

    const body = await req.json();
    const username = (body.username || '').toString().trim();
    const password = (body.password || '').toString().trim();
    const role = (body.role || '').toString().trim().toLowerCase();

    console.log('Login attempt:', { username, role });

    if (!username || !password || !role) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // --- ADMIN LOGIN ---
    if (role === 'admin') {
      const email = username.toLowerCase();

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      const isAdminUser = (user.role && user.role.toLowerCase() === 'admin') ||
        (user.department && user.department.toLowerCase() === 'admin');

      if (!isAdminUser) {
        return NextResponse.json({ message: 'Unauthorized for admin access' }, { status: 403 });
      }

      if (!user.password) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      const token = jwt.sign(
        { id: user._id.toString(), role: 'admin', department: 'admin' },
        JWT_SECRET,
        { expiresIn: TOKEN_MAX_AGE }
      );

      await User.updateOne(
        { _id: user._id },
        { $set: { sessionToken: token } }
      );

      const res = NextResponse.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          role: 'admin',
          department: 'admin'
        }
      });

      res.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: TOKEN_MAX_AGE
      });

      console.log('Admin login success:', email);

      await logActivity({
        action: "login",
        entity: "User",
        entityId: user._id,
        description: `Admin logged in: ${email}`,
        performedBy: {
          userId: user._id,
          name: user.name || "Admin",
          email: user.email,
          role: 'admin'
        },
        req: req
      });

      return res;
    }

    // --- SUPERVISOR LOGIN (using Email + DOB) ---
    if (role === 'supervisor') {
      // Normalize email to lowercase
      const email = username.toLowerCase();

      // First, check if user exists with supervisor role
      const user = await User.findOne({
        email: email,
        $or: [
          { role: 'supervisor' },
          { role: 'manager' },
          { role: 'lead' },
          { role: 'super_admin' },
          { isSupervisor: true }
        ]
      });

      console.log('Supervisor lookup result:', user ? 'Found' : 'Not found');

      if (!user) {
        // If no user found, check Employee collection for supervisors
        const employee = await Employee.findOne({
          'personalDetails.email': email,
          $or: [
            { 'jobDetails.designation': { $regex: /supervisor|manager|lead|head/i } },
            { 'jobDetails.isSupervisor': true }
          ]
        });

        console.log('Employee supervisor lookup result:', employee ? 'Found' : 'Not found');

        if (!employee) {
          return NextResponse.json({ message: 'Invalid email or Date of Birth' }, { status: 401 });
        }

        // Verify DOB for employee supervisor
        const rawDob = employee.personalDetails?.dateOfBirth;
        if (!rawDob) {
          return NextResponse.json({ message: 'Date of Birth not available' }, { status: 500 });
        }

        const dobDate = new Date(rawDob);
        if (isNaN(dobDate.getTime())) {
          return NextResponse.json({ message: 'Date of Birth format invalid' }, { status: 500 });
        }

        const dobString = dobDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Compare DOB
        if (dobString !== password) {
          return NextResponse.json({ message: 'Invalid email or Date of Birth' }, { status: 401 });
        }

        // Create token for employee supervisor
        const token = jwt.sign(
          {
            id: employee._id.toString(),
            role: 'supervisor',
            designation: employee.jobDetails.designation,
            department: employee.jobDetails.department,
            isEmployeeSupervisor: true
          },
          JWT_SECRET,
          { expiresIn: TOKEN_MAX_AGE }
        );

        // Update employee with sessionToken
        await Employee.updateOne(
          { _id: employee._id },
          { $set: { sessionToken: token } }
        );

        const res = NextResponse.json({
          user: {
            id: employee._id.toString(),
            email: employee.personalDetails.email,
            role: 'supervisor',
            designation: employee.jobDetails.designation,
            department: employee.jobDetails.department,
            isEmployeeSupervisor: true,
            personalDetails: {
              firstName: employee.personalDetails.firstName,
              lastName: employee.personalDetails.lastName
            }
          }
        });

        res.cookies.set('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: TOKEN_MAX_AGE
        });

        console.log('Employee supervisor login success:', email);

        await logActivity({
          action: "login",
          entity: "Employee",
          entityId: employee._id,
          description: `Supervisor (Employee) logged in: ${email}`,
          performedBy: {
            userId: employee._id,
            name: `${employee.personalDetails.firstName} ${employee.personalDetails.lastName}`,
            email: employee.personalDetails.email,
            role: 'supervisor'
          },
          req: req
        });

        return res;
      }

      // Handle existing User collection supervisor
      // For User collection, check password (assuming User has password field)
      if (!user.password) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
          role: 'supervisor',
          department: user.department || 'management',
          designation: user.designation || 'Supervisor'
        },
        JWT_SECRET,
        { expiresIn: TOKEN_MAX_AGE }
      );

      await User.updateOne(
        { _id: user._id },
        { $set: { sessionToken: token } }
      );

      const res = NextResponse.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          role: 'supervisor',
          department: user.department || 'management',
          designation: user.designation || 'Supervisor'
        }
      });

      res.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: TOKEN_MAX_AGE
      });

      console.log('User supervisor login success:', email);
      return res;
    }

    // --- EMPLOYEE LOGIN (using Employee ID + Password) ---
    if (role === 'employee') {
      // Find employee by employeeId
      // IMPORTANT: Need to explicitly select password as it is false by default
      const employee = await Employee.findOne({ employeeId: username }).select('+password');

      console.log('Employee lookup result:', employee ? 'Found' : 'not found');

      if (!employee) {
        return NextResponse.json({ message: 'Invalid Employee ID or Password' }, { status: 401 });
      }

      // Check if employee is a supervisor (shouldn't login as regular employee)
      if (employee.jobDetails.designation?.match(/supervisor|manager|lead|head/i)) {
        return NextResponse.json({
          message: 'Supervisors should use Supervisor login with email'
        }, { status: 403 });
      }

      // Check if password exists (migrated users might not have it)
      if (!employee.password) {
        return NextResponse.json({ message: 'Password not set for this account. Please contact HR.' }, { status: 403 });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid Employee ID or Password' }, { status: 401 });
      }

      // Create token with role as "employee"
      const token = jwt.sign(
        {
          id: employee._id.toString(),
          role: 'employee',
          designation: employee.jobDetails.designation,
          department: employee.jobDetails.department
        },
        JWT_SECRET,
        { expiresIn: TOKEN_MAX_AGE }
      );

      // Update employee with sessionToken
      await Employee.updateOne(
        { _id: employee._id },
        { $set: { sessionToken: token } }
      );

      const res = NextResponse.json({
        user: {
          id: employee._id.toString(),
          email: employee.personalDetails.email,
          role: 'employee',
          designation: employee.jobDetails.designation,
          department: employee.jobDetails.department,
          personalDetails: {
            firstName: employee.personalDetails.firstName,
            lastName: employee.personalDetails.lastName
          }
        }
      });

      res.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: TOKEN_MAX_AGE
      });

      console.log('Employee login success:', username);

      await logActivity({
        action: "login",
        entity: "Employee",
        entityId: employee._id,
        description: `Employee logged in: ${username}`,
        performedBy: {
          userId: employee._id,
          name: `${employee.personalDetails.firstName} ${employee.personalDetails.lastName}`,
          email: employee.personalDetails.email,
          role: 'employee'
        },
        req: req
      });

      return res;
    }

    // --- ATTENDANCE-ONLY LOGIN (using Employee ID + Password) ---
    if (role === 'attendance_only') {
      // Find employee by employeeId with attendance_only role
      const employee = await Employee.findOne({
        employeeId: username,
        role: 'attendance_only'
      }).select('+password');

      console.log('Attendance-only user lookup:', employee ? 'Found' : 'Not found');

      if (!employee) {
        return NextResponse.json({ message: 'Invalid Employee ID or Password' }, { status: 401 });
      }

      // Check if password is set
      if (!employee.password) {
        return NextResponse.json({ message: 'Password not set. Contact admin.' }, { status: 401 });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, employee.password);
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'Invalid Employee ID or Password' }, { status: 401 });
      }

      // Create token with attendance_only role
      const token = jwt.sign(
        {
          id: employee._id.toString(),
          role: 'attendance_only',
          department: employee.jobDetails?.department || 'N/A'
        },
        JWT_SECRET,
        { expiresIn: TOKEN_MAX_AGE }
      );

      // Update with sessionToken
      await Employee.updateOne(
        { _id: employee._id },
        { $set: { sessionToken: token } }
      );

      const res = NextResponse.json({
        user: {
          id: employee._id.toString(),
          employeeId: employee.employeeId,
          role: 'attendance_only',
          permissions: ['attendance']
        }
      });

      res.cookies.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: TOKEN_MAX_AGE
      });

      console.log('Attendance-only login success:', username);

      await logActivity({
        action: "login",
        entity: "Employee",
        entityId: employee._id,
        description: `Attendance-only user logged in: ${username}`,
        performedBy: {
          userId: employee._id,
          name: employee.employeeId,
          email: '',
          role: 'attendance_only'
        },
        req: req
      });

      return res;
    }

    return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Server error: ' + err.message }, { status: 500 });
  }
}