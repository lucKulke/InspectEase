"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Zap, Save, Play } from "lucide-react";
// import { generateText } from "ai";
// import { openai } from "@ai-sdk/openai";
import { UUID } from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  IStringExtractionTrainingExampleResponse,
  IStringExtractionTrainingResponse,
} from "@/lib/database/form-builder/formBuilderInterfaces";
import {
  delteExamples,
  fetchExistingExamples,
  insertNewExamples,
  requestToChatGPT,
  updateExamples,
  updateStringExtractionTrainingPrompt,
} from "./actions";
import { useNotification } from "@/app/context/NotificationContext";
import { Spinner } from "@/components/Spinner";

export interface Example {
  id: UUID;
  input: string;
  output: string;
}

interface ExtractionSectionProps {
  stringExtractionTraining: IStringExtractionTrainingResponse | null;
  stringExtractionTrainingExamples:
    | IStringExtractionTrainingExampleResponse[]
    | null;
  trainingId: UUID;
}

export const ExtractionSection = ({
  stringExtractionTraining,
  stringExtractionTrainingExamples,
  trainingId,
}: ExtractionSectionProps) => {
  const { showNotification } = useNotification();
  if (!stringExtractionTraining || !stringExtractionTrainingExamples) return;
  const dbPrompt = stringExtractionTraining.prompt
    ? stringExtractionTraining.prompt
    : "";
  const [prompt, setPrompt] = useState<string>(dbPrompt);

  const [newPrompt, setNewPrompt] = useState<string>(dbPrompt);

  const dbExamples = stringExtractionTrainingExamples.map((example) => {
    const newExample: Example = {
      id: example.id,
      input: example.input,
      output: example.output,
    };
    return newExample;
  });

  const [examples, setExamples] = useState<Example[]>(dbExamples);

  const [somethingChanged, setSomethingChanged] = useState<boolean>();
  const [testInput, setTestInput] = useState<string>("");
  const [testOutput, setTestOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("train");

  const addExample = () => {
    setExamples([...examples, { id: uuidv4() as UUID, input: "", output: "" }]);
  };

  const removeExample = (index: number) => {
    const newExamples = [...examples];
    newExamples.splice(index, 1);
    setExamples(newExamples);
  };

  const updateExample = (
    index: number,
    field: "input" | "output",
    value: string
  ) => {
    const newExamples = [...examples];
    newExamples[index][field] = value;

    setExamples(newExamples);
  };

  useEffect(() => {
    if (hasChanges() || newPrompt !== prompt) {
      setSomethingChanged(true);
    } else {
      setSomethingChanged(false);
    }
  }, [examples, newPrompt]);

  const hasChanges = () => {
    return JSON.stringify(examples) !== JSON.stringify(dbExamples);
  };

  const llmRequest = async () => {
    const output = await requestToChatGPT(testInput, prompt, examples);
    console.log("output", output);
    if (output) setTestOutput(output);
  };

  const saveTrainingsData = async () => {
    if (!stringExtractionTraining) return;

    setIsLoading(true);
    setSomethingChanged(false);
    try {
      if (newPrompt !== prompt) {
        const {
          updatedStringExtractionTrainingPrompt,
          updatedStringExtractionTrainingPromptError,
        } = await updateStringExtractionTrainingPrompt(newPrompt, trainingId);

        if (updatedStringExtractionTrainingPromptError) {
          showNotification(
            "fetch examples",
            `Error: ${updatedStringExtractionTrainingPromptError.message} (${updatedStringExtractionTrainingPromptError.code})`,
            "error"
          );
          throw updatedStringExtractionTrainingPromptError;
        } else if (updatedStringExtractionTrainingPrompt) {
          if (updatedStringExtractionTrainingPrompt.prompt)
            setPrompt(updatedStringExtractionTrainingPrompt.prompt);
        }
      }
      const {
        stringExtractionTrainingExamples,
        stringExtractionTrainingExamplesError,
      } = await fetchExistingExamples(trainingId);

      if (stringExtractionTrainingExamplesError) {
        showNotification(
          "fetch examples",
          `Error: ${stringExtractionTrainingExamplesError.message} (${stringExtractionTrainingExamplesError.code})`,
          "error"
        );
        throw stringExtractionTrainingExamplesError;
      }

      const existingIds = new Set(
        stringExtractionTrainingExamples?.map((e) => e.id) || []
      );
      const newIds = new Set(examples.map((e) => e.id));

      const toDelete = [...existingIds].filter((id) => !newIds.has(id));
      const toUpdate = examples.filter((e) => existingIds.has(e.id));
      const toInsert = examples.filter((e) => !existingIds.has(e.id));

      // Delete removed examples
      if (toDelete.length > 0) {
        const {
          deletedStringExtractionExamples,
          deletedStringExtractionExamplesError,
        } = await delteExamples(toDelete);
        if (deletedStringExtractionExamplesError) {
          showNotification(
            "fetch examples",
            `Error: ${deletedStringExtractionExamplesError.message} (${deletedStringExtractionExamplesError.code})`,
            "error"
          );
          throw deletedStringExtractionExamplesError;
        }
      }

      // Update existing examples
      if (toUpdate.length > 0) {
        await updateExamples(toUpdate);
      }

      // Insert new examples
      if (toInsert.length > 0) {
        const insert = toInsert.map((ex) => ({
          id: ex.id,
          training_id: stringExtractionTraining.id,
          input: ex.input,
          output: ex.output,
        }));
        const {
          stringExtractionTrainingExample,
          stringExtractionTrainingExampleError,
        } = await insertNewExamples(insert);
        if (stringExtractionTrainingExampleError) {
          showNotification(
            "fetch examples",
            `Error: ${stringExtractionTrainingExampleError.message} (${stringExtractionTrainingExampleError.code})`,
            "error"
          );
          throw stringExtractionTrainingExampleError;
        }
      }
    } catch (error) {
      console.error("Error saving training data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">
        AI String Extraction Trainer: {stringExtractionTraining?.name}
      </h1>
      <p className="text-gray-600 mb-8">
        Train an AI model to extract specific information from text by providing
        examples.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="train">Train Model</TabsTrigger>
          <TabsTrigger value="test">Test Extraction</TabsTrigger>
        </TabsList>

        <TabsContent value="train" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Define Your Extraction Task</CardTitle>
              <CardDescription>
                Provide clear instructions on what information should be
                extracted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., Extract the measurement value from the text."
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Training Examples</CardTitle>
                <CardDescription>
                  Add input/output pairs to teach the model what to extract
                </CardDescription>
              </div>
              <Badge variant="outline" className="ml-2">
                {examples.length} Examples
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {examples.map((example, index) => (
                <div key={index} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Example {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExample(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder="Input text"
                        value={example.input}
                        onChange={(e) => {
                          updateExample(index, "input", e.target.value);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Expected output"
                        value={example.output}
                        onChange={(e) =>
                          updateExample(index, "output", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {index < examples.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={addExample}>
                <Plus className="mr-2 h-4 w-4" /> Add Example
              </Button>
              <div className="flex space-x-2 items-center">
                {isLoading && <Spinner></Spinner>}
                {somethingChanged ? (
                  <Button
                    onClick={() => {
                      saveTrainingsData();
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Training Data
                  </Button>
                ) : (
                  <Button variant={"outline"}>
                    <Save className="mr-2 h-4 w-4" /> Save Training Data
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Extraction Model</CardTitle>
              <CardDescription>
                Enter a new input to see what the model extracts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Test Input</label>
                <Textarea
                  placeholder="E.g., The height is approximately 45 inches"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    llmRequest();
                  }}
                  disabled={isLoading || !testInput}
                  className="w-full md:w-auto"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Play className="mr-2 h-4 w-4" /> Test Extraction
                    </span>
                  )}
                </Button>
              </div>
              {testOutput && (
                <div className="mt-4">
                  <label className="text-sm font-medium">
                    Extracted Output
                  </label>
                  <div className="mt-1 p-4 bg-muted rounded-md flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-mono">{testOutput}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Training Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Prompt</h3>
                <p className="mt-1 text-sm bg-muted p-3 rounded-md">{prompt}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">
                  Examples ({examples.length})
                </h3>
                <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {examples.map((ex, i) => (
                    <div key={i} className="text-sm bg-muted p-2 rounded-md">
                      <span className="font-semibold">Input:</span> {ex.input}
                      <br />
                      <span className="font-semibold">Output:</span> {ex.output}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};
