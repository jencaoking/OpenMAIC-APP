export type PropertyControlType =
  | 'input'
  | 'textarea'
  | 'slider'
  | 'select'
  | 'color-picker'
  | 'switch'
  | 'number-input';

export interface PropertyField {
  type: string;
  label: string;
  control: PropertyControlType;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  placeholder?: string;
}

export interface PropertySection {
  [key: string]: PropertyField | PropertySection;
}

export interface PropertySchema {
  [key: string]: PropertyField | PropertySection;
}

export type ComponentPropertySchemas = Record<string, PropertySchema>;