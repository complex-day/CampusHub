import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

userSchema.index({ collegeId: 1, email: 1 }, { unique: true });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
