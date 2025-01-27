import {
  Vehicle,
  InspectionPlan,
  Metadata,
  AnnotationData,
  ResponseMetadata,
  DBInsertAnnotationData,
  DBSelectAnnotationData,
  MainSection,
  SubSection,
  FieldGroup,
  Field,
  Task,
  Training,
  FillableFormsMetadata,
  FillableFormFields,
} from "./interfaces";

export class DBActions {
  supabase: any;
  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async createNewVehicle(
    formData: any
  ): Promise<{ data: Vehicle[]; error: any }> {
    const { data, error } = await this.supabase
      .from("vehicles")
      .insert([
        {
          type: formData.type,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          hsn: formData.hsn,
          tsn: formData.tsn,
        },
      ])
      .select();

    return { data, error };
  }

  async fetchVehicles(): Promise<{ vehicles: Vehicle[]; error: any }> {
    const { data: vehicles, error } = await this.supabase
      .from("vehicles")
      .select("*");

    return { vehicles, error };
  }

  async fetchVehicle(
    vehicle_id: string
  ): Promise<{ vehicles: Vehicle[] | null; error: any }> {
    let { data: vehicles, error } = await this.supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicle_id);

    return { vehicles, error };
  }
  async fetchInspectionPlans(
    vehicle_id: string
  ): Promise<{ inspectionPlans: InspectionPlan[]; inspectionPlansError: any }> {
    let { data, error } = await this.supabase
      .from("inspection_plans")
      .select("*")
      .eq("vehicle_id", vehicle_id);

    return { inspectionPlans: data, inspectionPlansError: error };
  }

  async createFillableForm(formData: {
    orderNumber: string;
    inspectionPlanId: string;
  }): Promise<{
    fillableForm: FillableFormsMetadata;
    fillableFormError: any;
  }> {
    const { data, error } = await this.supabase
      .from("inspection_plan_fillable_forms")
      .insert([
        {
          order_number: formData.orderNumber,
          inspection_plan_id: formData.inspectionPlanId,
        },
      ])
      .select();
    return { fillableForm: data[0], fillableFormError: error };
  }

  async createFillableFormFields(
    fillableFormFields: {
      field_id: string;
      fillable_form_id: string;
    }[]
  ): Promise<{
    fillableFormFields: FillableFormFields[];
    fillableFormFieldsError: any;
  }> {
    const { data, error } = await this.supabase
      .from("inspection_plan_fillable_form_fields")
      .insert(fillableFormFields)
      .select();

    return { fillableFormFields: data, fillableFormFieldsError: error };
  }

  async createInspectionPlan(metadata: Metadata): Promise<{
    inspectionPlanResult: ResponseMetadata[];
    inspectionPlanResultError: any;
  }> {
    const { data, error } = await this.supabase
      .from("inspection_plans")
      .insert([
        {
          vehicle_id: metadata.vehicle_id,
          inspection_name: metadata.name,
          description: metadata.description,
          frequency: metadata.frequency,
          maintenance_interval_type: metadata.type,
        },
      ])
      .select();

    const inspectionPlanResult = data;
    const inspectionPlanResultError = error;
    return { inspectionPlanResult, inspectionPlanResultError };
  }

  async createDocumentAnnotations(
    annotationData: AnnotationData[],
    inspection_plan_id: string
  ): Promise<{
    annotationResult: AnnotationData[] | null;
    annotationResultError: any;
  }> {
    const convertedAnnotationData: DBInsertAnnotationData[] = [];

    annotationData.forEach((data) => {
      const anno = {
        inspection_plan_id: inspection_plan_id,
        page: data.pageNumber,
        type: data.type,
        field_id: data.contents,
        x1: data.rect.x1,
        y1: data.rect.y1,
        x2: data.rect.x2,
        y2: data.rect.y2,
      };
      convertedAnnotationData.push(anno);
    });

    const { data, error } = await this.supabase
      .from("document_annotations")
      .insert(convertedAnnotationData)
      .select();

    const annotationResult = data;
    const annotationResultError = error;
    return { annotationResult, annotationResultError };
  }

  async uploadDocumentToBucket(
    file: File,
    fileName: string
  ): Promise<{
    bucketResult: AnnotationData[] | null;
    bucketResultError: any;
  }> {
    const { data, error } = await this.supabase.storage
      .from("inspectionPlanPDFs") // Replace with your bucket name
      .upload(fileName, await file.arrayBuffer(), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    const bucketResult = data;
    const bucketResultError = error;

    return { bucketResult, bucketResultError };
  }

  async getUrlForDocument(document_uuid: string): Promise<{
    data: any;
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase.storage
      .from("inspectionPlanPDFs")
      .createSignedUrl(document_uuid + ".pdf", 60);

    return { data, error };
  }

  async fetchInspectionPlanMetaData(inspection_plan_id: string): Promise<{
    inspectionPlanMetaData: ResponseMetadata[];
    inspectionPlanMetaDataError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plans")
      .select("*")
      .eq("id", inspection_plan_id);

    return { inspectionPlanMetaData: data, inspectionPlanMetaDataError: error };
  }

  async fetchFieldTraining(
    fieldId: string
  ): Promise<{ data: Training[]; error: any }> {
    let { data, error } = await this.supabase
      .from("inspection_plan_field_trainings")
      .select("*")
      .eq("field_id", fieldId);

    return { data, error };
  }
  async fetchField(fieldId: string): Promise<{ data: Field[]; error: any }> {
    let { data, error } = await this.supabase
      .from("inspection_plan_fields")
      .select("*")
      .eq("id", fieldId);

    return { data, error };
  }

  async inspectionPlanFormCreateMainSection(newMainSection: {
    name: string;
    inspection_plan_id: string;
  }): Promise<{
    data: MainSection[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_main_sections")
      .insert([newMainSection])
      .select();

    return { data, error };
  }
  async inspectionPlanFormFetchMainSection(inspectionPlanId: string): Promise<{
    mainSections: MainSection[];
    mainSectionErrors: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_main_sections")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { mainSections: data, mainSectionErrors: error };
  }
  async inspectionPlanFormFetchSubSection(inspectionPlanId: string): Promise<{
    subSections: SubSection[];
    subSectionsError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_sub_sections")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { subSections: data, subSectionsError: error };
  }

  async inspectionPlanFormFetchSubSectionByMainSection(
    mainSectionId: string
  ): Promise<{
    subSections: SubSection[];
    subSectionsError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_sub_sections")
      .select("*")
      .eq("main_section_id", mainSectionId);

    return { subSections: data, subSectionsError: error };
  }

  async inspectionPlanFormFetchFieldGroup(inspectionPlanId: string): Promise<{
    data: FieldGroup[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_field_groups")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { data, error };
  }

  async inspectionPlanFormFetchFieldGroupsBySubSectionId(
    subSectionId: string
  ): Promise<{
    fieldGroups: FieldGroup[];
    fieldGroupsError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_field_groups")
      .select("*")
      .eq("sub_section_id", subSectionId);

    return { fieldGroups: data, fieldGroupsError: error };
  }

  async inspectionPlanFormFetchFields(inspectionPlanId: string): Promise<{
    fields: Field[];
    fieldsError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_fields")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { fields: data, fieldsError: error };
  }

  async inspectionPlanFormFetchFieldsByFieldGroupId(
    fieldGroupId: string
  ): Promise<{
    fields: Field[];
    fieldsError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_fields")
      .select("*")
      .eq("field_group_id", fieldGroupId);

    return { fields: data, fieldsError: error };
  }

  async inspectionPlanFormFetchTask(inspectionPlanId: string): Promise<{
    data: Task[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_tasks")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { data, error };
  }

  async inspectionPlanFormFetchAnnotation(inspectionPlanId: string): Promise<{
    annotations: DBSelectAnnotationData[];
    annotationsError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("document_annotations")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { annotations: data, annotationsError: error };
  }

  async inspectionPlanFormCreateSubSection(newSubSection: {
    name: string;
    main_section_id: string;
    inspection_plan_id: string;
  }): Promise<{
    data: SubSection[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_sub_sections")
      .insert([newSubSection])
      .select();

    return { data, error };
  }

  async inspectionPlanFormCreateFieldGroup(newFieldGroup: {
    type: string;
    sub_section_id: string;
    inspection_plan_id: string;
  }): Promise<{
    data: FieldGroup[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_field_groups")
      .insert([newFieldGroup])
      .select();

    return { data, error };
  }

  async inspectionPlanFormCreateFieldTraining(newFieldTraining: {
    sentence: string;
    extracted_substring: string;
    field_id: string;
  }): Promise<{
    data: Training[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_field_trainings")
      .insert([newFieldTraining])
      .select();

    return { data, error };
  }

  async inspectionPlanFormDeleteFieldTraining(
    fieldTrainingId: string
  ): Promise<{
    data: Training[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_field_trainings")
      .delete()
      .eq("id", fieldTrainingId);

    return { data, error };
  }

  async deleteInspectionPlan(inspectionPlanId: string): Promise<{
    data: ResponseMetadata[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plans")
      .delete()
      .eq("id", inspectionPlanId);

    return { data, error };
  }

  async inspectionPlanFormDeleteSubSection(subSectionId: string): Promise<{
    data: SubSection[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_sub_sections")
      .delete()
      .eq("id", subSectionId);

    return { data, error };
  }

  async inspectionPlanFormDeleteMainSection(mainSectionId: string): Promise<{
    data: MainSection[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_main_sections")
      .delete()
      .eq("id", mainSectionId);

    return { data, error };
  }

  async inspectionPlanFormDeleteFieldGroup(fieldGroupId: string): Promise<{
    data: FieldGroup[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_field_groups")
      .delete()
      .eq("id", fieldGroupId);

    return { data, error };
  }

  async inspectionPlanFormDeleteField(fieldId: string): Promise<{
    data: Field[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_fields")
      .delete()
      .eq("id", fieldId);

    return { data, error };
  }

  async inspectionPlanFormDeleteTask(taskId: string): Promise<{
    data: Task[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_tasks")
      .delete()
      .eq("id", taskId);

    return { data, error };
  }

  async inspectionPlanFormCreateField(newField: {
    field_group_id: string;
    description: string;
    inspection_plan_id: string;
    annotation_id: string;
  }): Promise<{
    data: Field[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_fields")
      .insert([newField])
      .select();

    return { data, error };
  }

  async inspectionPlanFormCreateTask(newTask: {
    field_group_id: string;
    description: string;
    inspection_plan_id: string;
  }): Promise<{
    data: Task[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_tasks")
      .insert([newTask])
      .select();

    return { data, error };
  }

  async inspectionPlanFetchFillableForms(): Promise<{
    forms: FillableFormsMetadata[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_fillable_forms")
      .select("*");

    return { forms: data, error };
  }

  async inspectionPlanFetchFillableForm(formId: string): Promise<{
    form: FillableFormsMetadata;
    formError: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_fillable_forms")
      .select("*")
      .eq("id", formId);

    return { form: data[0], formError: error };
  }
}
