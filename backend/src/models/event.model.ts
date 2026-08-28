import { Schema, model, type InferSchemaType } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, required: true, trim: true, minlength: 1, maxlength: 10000 },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", default: null },
    eventDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
    posterUrl: { type: String, trim: true, maxlength: 2048 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

eventSchema.index({ collegeId: 1, eventDate: 1 });
eventSchema.index({ collegeId: 1, departmentId: 1, eventDate: 1 });
eventSchema.index({ title: "text", description: "text" });

export type EventDocument = InferSchemaType<typeof eventSchema>;
export const Event = model("Event", eventSchema);