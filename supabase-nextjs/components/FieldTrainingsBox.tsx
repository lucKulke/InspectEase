"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Field, Training } from "@/lib/interfaces";
import { createClient } from "@/utils/supabase/client";
import { DBActions } from "@/lib/dbActions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Plus, Dot, Trash2, Ellipsis } from "lucide-react";
interface FieldTrainingsBoxProps {
  fieldId: string;
}

const FieldTrainingsBox = ({ fieldId }: FieldTrainingsBoxProps) => {
  const supabase = createClient();
  const dbActions = new DBActions(supabase);
  const [trainingsData, setTrainingsData] = useState<Training[]>([]);
  const [sentence, setSentence] = useState<string>("");
  const [extractedSubString, setExtractedSubString] = useState<string>("");
  const [openAddTraining, setOpenAddTraining] = useState<boolean>(false);
  const [field, setField] = useState<Field>();

  const fetchTrainingsData = async () => {
    const { data, error } = await dbActions.fetchFieldTraining(fieldId);

    setTrainingsData(data);
  };

  const fetchFieldData = async () => {
    const { data, error } = await dbActions.fetchField(fieldId);
    setField(data[0]);
  };

  useEffect(() => {
    fetchTrainingsData();
    fetchFieldData();
  }, []);

  const handleAddTraining = async () => {
    const { data, error } =
      await dbActions.inspectionPlanFormCreateFieldTraining({
        sentence: sentence,
        extracted_substring: extractedSubString,
        field_id: fieldId,
      });

    setTrainingsData([...trainingsData, data[0]]);
  };

  const handleDeleteTraining = async (fieldTrainingId: string) => {
    const { data, error } =
      await dbActions.inspectionPlanFormDeleteFieldTraining(fieldTrainingId);

    setTrainingsData(
      trainingsData.filter((training) => {
        return training.id !== fieldTrainingId;
      })
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Training for field: {field?.description}</CardTitle>
        </CardHeader>
        <CardContent className="h-[50vh] overflow-y-auto">
          <div className="p-3">
            <Table>
              <TableCaption>A list of all trainings data .</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Sentence</TableHead>
                  <TableHead className="text-right">SubString</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingsData.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell>{training.sentence}</TableCell>
                    <TableCell className="text-right">
                      {training.extracted_substring}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger>
                          <Ellipsis className="text-slate-500 "></Ellipsis>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => handleDeleteTraining(training.id)}
                          >
                            delete <Trash2></Trash2>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Dialog open={openAddTraining} onOpenChange={setOpenAddTraining}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Training</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add new training</DialogTitle>
                <DialogDescription>
                  Create a example sentence and enter the extracted substring.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sentence" className="text-right">
                    Sentence
                  </Label>
                  <Input
                    id="sentence"
                    value={sentence} // Controlled input
                    onChange={(e) => setSentence(e.target.value)} // Update state on input change
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="extractedSubString" className="text-right">
                    SubString
                  </Label>
                  <Input
                    id="extractedSubString"
                    value={extractedSubString} // Controlled input
                    onChange={(e) => setExtractedSubString(e.target.value)} // Update state on input change
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                {sentence.length > 3 && extractedSubString.length > 0 ? (
                  <Button onClick={() => handleAddTraining()}>
                    Save changes
                  </Button>
                ) : (
                  <Button disabled variant="outline">
                    Save changes
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FieldTrainingsBox;
