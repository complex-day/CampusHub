import { Announcement } from "../models/announcement.model.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";

export async function getAdminMetrics(collegeId: string) {
  const scope = { collegeId };
  const [users, colleges, departments, announcements, events] = await Promise.all([
    User.countDocuments(scope),
    College.countDocuments({ _id: collegeId }),
    Department.countDocuments(scope),
    Announcement.countDocuments(scope),
    Event.countDocuments(scope)
  ]);

  return { users, colleges, departments, announcements, events };
}