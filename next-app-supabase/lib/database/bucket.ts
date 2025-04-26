import { SupabaseClient } from "@supabase/supabase-js";
import { StorageError, SupabaseError } from "../globalInterfaces";
import { UUID } from "crypto";

export class DBActionsBucket {
  private supabase: SupabaseClient<any, string, any>;

  constructor(supabase: SupabaseClient<any, string, any>) {
    this.supabase = supabase;
  }

  async uploadDocument(fileName: UUID, file: File) {
    const { data, error } = await this.supabase.storage
      .from("documents")
      .upload("private/" + fileName, await file.arrayBuffer(), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    console.log("storage upload document", data);
    if (error) {
      console.error("error during document upload to bucket", error);
    }

    return { bucketResponse: data, bucketError: error };
  }

  async downloadDocumentViaSignedUrl(docId: UUID) {
    const { data, error } = await this.supabase.storage
      .from("documents")
      .createSignedUrl("private/" + docId, 86400);

    console.log("storage download document", data?.signedUrl);

    return { bucketResponse: data, bucketError: error };
  }
}
