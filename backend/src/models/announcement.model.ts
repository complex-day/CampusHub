import { Schema, model, type InferSchemaType } from "mongoose";

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 1, maxlength: 10000 },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

announcementSchema.index({ collegeId: 1, departmentId: 1, createdAt: -1 });

export type AnnouncementDocument = InferSchemaType<typeof announcementSchema>;
export const Announcement = model("Announcement", announcementSchema);