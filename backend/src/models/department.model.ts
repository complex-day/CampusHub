import { Schema, model, type InferSchemaType } from "mongoose";

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    collegeId: { type: Schema.Types.ObjectId, ref: "College", required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

departmentSchema.index({ collegeId: 1, name: 1 }, { unique: true });

export type DepartmentDocument = InferSchemaType<typeof departmentSchema>;
export const Department = model("Department", departmentSchema);