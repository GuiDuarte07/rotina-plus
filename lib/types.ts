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

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface DataType {
  id: string;
  name: string;
  description?: string;
  frequency: FrequencyType;
  fields: Field[];
  color: string;
  icon?: string;
  createdAt: string;
}

export interface EntryField {
  fieldId: string;
  value: any;
}

export interface Entry {
  id: string;
  dataTypeId: string;
  date: string;
  fields: EntryField[];
  createdAt: string;
}
