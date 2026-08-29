import { Schema, model, type InferSchemaType } from "mongoose";

const eventRsvpSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed", required: true },
    ticketNumber: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

eventRsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventRsvpSchema.index({ userId: 1, collegeId: 1, status: 1 });
eventRsvpSchema.index({ eventId: 1, status: 1 });
eventRsvpSchema.index({ collegeId: 1, createdAt: -1 });

export type EventRsvpDocument = InferSchemaType<typeof eventRsvpSchema>;
export const EventRSVP = model("EventRSVP", eventRsvpSchema);
