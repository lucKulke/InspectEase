"use server";

import { DBActionsFormBuilderFetch } from "@/lib/database/form-builder/formBuilderFetch";
import { createClient } from "@/utils/supabase/server";
import { UUID } from "crypto";

export async function createMultipleChoiceGroup(subSectionId: UUID) {}
export async function createSingleChoiceGroup(subSectionId: UUID) {}
export async function createTextInputGroup(subSectionId: UUID) {}
