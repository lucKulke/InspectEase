import {
  Vehicle,
  InspectionPlan,
  Metadata,
  AnnotationData,
  ResponseMetadata,
  DBAnnotationData,
  MainSection,
  SubSection,
} from "./interfaces";

export class DBActions {
  supabase: any;
  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async createNewVehicle(
    formData: any
  ): Promise<{ data: Vehicle[] | null; error: any }> {
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

  async fetchVehicles(): Promise<{ vehicles: Vehicle[] | null; error: any }> {
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
  ): Promise<{ inspectionPlans: InspectionPlan[]; error: any }> {
    let { data: inspectionPlans, error } = await this.supabase
      .from("inspection_plans")
      .select("*")
      .eq("vehicle_id", vehicle_id);
    if (!inspectionPlans) {
      inspectionPlans = [];
    }
    return { inspectionPlans, error };
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
    const convertedAnnotationData: DBAnnotationData[] = [];

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
    data: ResponseMetadata[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plans")
      .select("*")
      .eq("id", inspection_plan_id);

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
    data: MainSection[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_main_sections")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { data, error };
  }
  async inspectionPlanFormFetchSubSection(inspectionPlanId: string): Promise<{
    data: SubSection[];
    error: any;
  }> {
    // Replace with your bucket name
    const { data, error } = await this.supabase
      .from("inspection_plan_sub_sections")
      .select("*")
      .eq("inspection_plan_id", inspectionPlanId);

    return { data, error };
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
}
