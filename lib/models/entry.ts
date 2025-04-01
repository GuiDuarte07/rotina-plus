import mongoose, { Schema, type Document } from "mongoose"

export interface IEntryField {
  fieldId: string
  value: any
}

export interface IEntry extends Document {
  userId: mongoose.Types.ObjectId
  dataTypeId: mongoose.Types.ObjectId
  date: Date
  fields: IEntryField[]
  createdAt: Date
  updatedAt: Date
}

const EntryFieldSchema: Schema = new Schema({
  fieldId: { type: String, required: true },
  value: { type: Schema.Types.Mixed },
})

const EntrySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  dataTypeId: { type: Schema.Types.ObjectId, ref: "DataType", required: true },
  date: { type: Date, required: true },
  fields: [EntryFieldSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Índice para buscar entradas por usuário e data
EntrySchema.index({ userId: 1, date: 1 })
// Índice para buscar entradas por tipo de dado e data
EntrySchema.index({ dataTypeId: 1, date: 1 })

export default mongoose.models.Entry || mongoose.model<IEntry>("Entry", EntrySchema)

