import ActivityLog from "@/lib/db/models/ActivityLog";
import dbConnect from "@/lib/db/connect";

/**
 * Logs an activity to the database.
 * 
 * @param {string} action - The action performed (e.g., 'created', 'updated', 'deleted')
 * @param {string} entity - The entity being acted upon (e.g., 'Employee', 'Payslip')
 * @param {string} description - Human readable description
 * @param {string} entityId - (Optional) ID of the entity
 * @param {Object} performedBy - (Optional) User info { userId, name, email, role }
 * @param {Object} details - (Optional) Additional details/metadata
 * @param {string} status - (Optional) 'success' or 'failed', defaults to 'success'
 * @param {Request} req - (Optional) The Next.js request object to extract IP/UserAgent
 */
export async function logActivity({
  action,
  entity,
  description,
  entityId = null,
  performedBy = null,
  details = null,
  status = "success",
  req = null,
}) {
  try {
    await dbConnect();

    let ipAddress = "Unknown";
    let userAgent = "Unknown";

    if (req) {
      ipAddress = req.headers.get("x-forwarded-for") || "Unknown";
      userAgent = req.headers.get("user-agent") || "Unknown";
    }

    // If performedBy is missing but we have headers/context, we might extract it here if implemented globally
    // For now, rely on passed object.

    const logEntry = {
      action,
      entity,
      entityId,
      description,
      performedBy: performedBy || { name: "System" }, // Default to System if no user provided
      details,
      status,
      ipAddress,
      userAgent,
    };

    const log = await ActivityLog.create(logEntry);
    console.log(`[ActivityLog] ${action} ${entity}: ${description}`);
    return log;
  } catch (error) {
    console.error("[ActivityLog] Failed to save log:", error);
    // Silent fail to not disrupt main flow
    return null;
  }
}
