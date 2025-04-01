import mongoose, { Schema, type Document } from "mongoose";

export type FieldType =
  | "text"
  | "number"
  | "boolean"
  | "list"
  | "table"
  | "image"
  | "date";
export type FrequencyType =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "timeless";

export interface IField {
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // Para campos do tipo lista
  defaultValue?: any;
}

export interface IDataType extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  frequency: FrequencyType;
  fields: IField[];
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["text", "number", "boolean", "list", "table", "image", "date"],
  },
  required: { type: Boolean, default: true },
  options: [String],
  defaultValue: { type: Schema.Types.Mixed },
});

const DataTypeSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  frequency: {
    type: String,
    required: true,
    enum: ["daily", "weekly", "monthly", "yearly", "timeless"],
  },
  fields: [FieldSchema],
  color: { type: String, default: "#3b82f6" }, // Cor padrão azul
  icon: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Índice composto para garantir que cada usuário tenha nomes únicos para seus tipos de dados
DataTypeSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.models.DataType ||
  mongoose.model<IDataType>("DataType", DataTypeSchema);
