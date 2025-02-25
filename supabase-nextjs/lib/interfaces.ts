export interface Vehicle {
  id: string;
  created_at: string;
  type: string;
  make: string;
  model: string;
  hsn: string;
  tsn: string;
  year: string;
  inspection_plan_count: string;
}

export interface InspectionPlan {
  id: string;
  created_at: string;
  vehicle_id: string;
  inspection_name: string;
  description: string;
  frequency: string;
  updated_at: string;
  user_id: string;
  document_uuid: string;
}

export interface AnnotationRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface AnnotationData {
  contents: string;
  pageNumber: number;
  rect: AnnotationRect;
  type: "FreeText";
}

export interface DBInsertAnnotationData {
  inspection_plan_id: string;
  page: number;
  type: string;
  field_id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface DBSelectAnnotationData {
  id: string;
  inspection_plan_id: string;
  page: number;
  type: string;
  field_id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Metadata {
  vehicle_id: string;
  type: string;
  name: string;
  description: string;
  frequency: string;
  annotations: AnnotationData[];
}

export interface ResponseMetadata {
  id: string;
  created_at: string;
  vehicle_id: string;
  inspection_name: string;
  description: string;
  frequency: string;
  updated_at: null | string;
  user_id: string;
  document_uuid: string;
  maintenance_interval_type: string;
}

export interface GroupName {
  id: string;
  name: string;
}

export interface MainSection {
  id: string;
  name: string;
}

export interface SubSection {
  id: string;
  name: string;
  main_section_id: string;
}

export interface Task {
  id: string;
  description: string;
  field_group_id: string;
}

export interface FieldGroup {
  id: string;
  type: string;
  sub_section_id: string;
}

export interface Field {
  id: string;
  field_group_id: string;
  description: string;
  training_id: string | null;
  annotation_id: string;
}

export interface Training {
  id: string;
  field_id: string;
  sentence: string;
  extracted_substring: string;
}

export interface FillableFormsMetadata {
  id: string;
  order_number: string;
  progress: number;
  inspection_plan_id: string;
}

export interface FillableFormFields {
  id: string;
  created_at: string;
  field_id: string;
  fillable_form_id: string;
}
