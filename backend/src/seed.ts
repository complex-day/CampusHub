import bcrypt from "bcryptjs";
import { College } from "./models/college.model.js";
import { Department } from "./models/department.model.js";
import { User } from "./models/user.model.js";
import { Announcement } from "./models/announcement.model.js";
import { Event } from "./models/event.model.js";

export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const eventCount = await Event.countDocuments();
    if (eventCount > 0) {
      return; // Already populated
    }

    console.log("Seeding initial campus data for interactive testing...");

    // 1. Ensure College
    let college = await College.findOne({ name: "Apex Institute of Technology" });
    if (!college) {
      college = await College.create({
        name: "Apex Institute of Technology",
        description: "Premier academic and research university campus",
      });
    }

    // 2. Ensure Department
    let dept = await Department.findOne({ collegeId: college._id, name: "Computer Science & Engineering" });
    if (!dept) {
      dept = await Department.create({
        collegeId: college._id,
        name: "Computer Science & Engineering",
        description: "Department of Computer Science and Intelligent Systems",
      });
    }

    // 3. Ensure Faculty user
    let faculty = await User.findOne({ email: "faculty@campus.apex.edu" });
    if (!faculty) {
      const passwordHash = await bcrypt.hash("Faculty#2026", 12);
      faculty = await User.create({
        name: "Dr. Arvind Sharma",
        email: "faculty@campus.apex.edu",
        passwordHash,
        role: "faculty",
        collegeId: college._id,
        departmentId: dept._id,
      });
    }

    // 4. Ensure Student user
    let student = await User.findOne({ email: "student@campus.apex.edu" });
    if (!student) {
      const passwordHash = await bcrypt.hash("Student#2026", 12);
      student = await User.create({
        name: "Rohan Varma",
        email: "student@campus.apex.edu",
        passwordHash,
        role: "student",
        collegeId: college._id,
        departmentId: dept._id,
      });
    }

    // 5. Seed Announcements
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.create([
        {
          title: "Midterm Examination Schedule Released - Fall 2026",
          content: "The official midterm examination timetable is now published. All students must review seating arrangements and reporting times.",
          collegeId: college._id,
          priority: "urgent",
          authorId: faculty._id,
          createdAt: new Date(),
        },
        {
          title: "Department AI Research Symposium & Paper Submissions",
          content: "Call for papers: Submissions are open for the annual CSE symposium. Submit your drafts to the portal before next Friday.",
          collegeId: college._id,
          departmentId: dept._id,
          priority: "normal",
          authorId: faculty._id,
          createdAt: new Date(Date.now() - 3600000 * 12),
        },
        {
          title: "Campus Central Library Extended 24x7 Hours for Finals",
          content: "The library study halls and digital research labs are now accessible 24 hours daily with valid Student Passbook credentials.",
          collegeId: college._id,
          priority: "normal",
          authorId: faculty._id,
          createdAt: new Date(Date.now() - 3600000 * 36),
        },
      ]);
    }

    // 6. Seed Interactive Events
    const now = Date.now();
    await Event.create([
      {
        title: "Apex HackNation 2026 (48-Hour Hackathon)",
        description: "Join 150+ student developers, designers, and innovators building real-world AI and Web3 solutions. Mentors, prizes, and meals provided.",
        eventDate: new Date(now + 1000 * 60 * 60 * 24 * 4), // in 4 days
        location: "Main Innovation Hall, Block A",
        collegeId: college._id,
        createdBy: faculty._id,
        capacity: 150,
        createdAt: new Date(),
      },
      {
        title: "Autonomous Robotics & IoT Hands-on Workshop",
        description: "Hands-on build session with microcontrollers, LIDAR sensors, and ROS. Kits provided in the robotics lab.",
        eventDate: new Date(now + 1000 * 60 * 60 * 24 * 7), // in 7 days
        location: "Hardware & Robotics Lab 4",
        collegeId: college._id,
        departmentId: dept._id,
        createdBy: faculty._id,
        capacity: 40,
        createdAt: new Date(),
      },
      {
        title: "Tarang 2026 Annual Cultural Night & Band Performance",
        description: "The grand campus cultural celebration featuring live bands, classical fusion, theatrical acts, and food stalls.",
        eventDate: new Date(now + 1000 * 60 * 60 * 24 * 12), // in 12 days
        location: "Open Amphitheatre",
        collegeId: college._id,
        createdBy: faculty._id,
        capacity: 500,
        createdAt: new Date(),
      },
      {
        title: "AI & ML Career Bootcamp with Industry Leads",
        description: "Interactive session with engineering leads from top tech firms on portfolio building, system design, and AI interviews.",
        eventDate: new Date(now + 1000 * 60 * 60 * 24 * 2), // in 2 days
        location: "Seminar Hall A",
        collegeId: college._id,
        createdBy: faculty._id,
        capacity: 80,
        createdAt: new Date(),
      },
    ]);

    console.log("Seeding complete: Created interactive notices and events!");
  } catch (err) {
    console.error("Seeding warning:", err);
  }
}
