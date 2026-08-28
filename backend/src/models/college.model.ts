import { Schema, model, type InferSchemaType } from "mongoose";

const collegeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200, unique: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export type CollegeDocument = InferSchemaType<typeof collegeSchema>;
export const College = model("College", collegeSchema);