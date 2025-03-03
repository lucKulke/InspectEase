"use client";
import {
  IInspectableObjectInspectionFormMainSectionWithSubSection,
  IInspectableObjectInspectionFormSubSectionResponse,
  IInspectableObjectInspectionFormTextInputGroupResponse,
  IMultipleChoiceGroupResponse,
  ISingleChoiceGroupResponse,
  ITextInputGroupResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UUID } from "crypto";
import { Skeleton } from "@/components/ui/skeleton";

import { useNotification } from "@/app/context/NotificationContext";
import { Spinner } from "@/components/Spinner";

import {
  createMultipleChoiceGroup,
  createSingleChoiceGroup,
  createTextInputGroup,
  deleteMultipleChoiceGroup,
  deleteSingleChoiceGroup,
  deleteTextInputGroup,
  fetchMultipleChoiceGroupWithFields,
  fetchSingleChoiceGroupWithFields,
  fetchTextInputGroupWithFields,
} from "./actions";
import { flushSync } from "react-dom";

interface SubSectionProps {
  subSection: IInspectableObjectInspectionFormSubSectionResponse;

  mainSubSections: IInspectableObjectInspectionFormMainSectionWithSubSection[];
}

interface GroupState {
  multi: boolean;
  single: boolean;
  text: boolean;
}

export const SubSection = ({
  subSection,
  mainSubSections,
}: SubSectionProps) => {
  return <div></div>;
};
