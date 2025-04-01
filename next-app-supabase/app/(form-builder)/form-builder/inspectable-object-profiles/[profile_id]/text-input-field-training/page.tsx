"use client";

import { useState } from "react";
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

export default function TextInputFieldTrainingPage({
  params,
}: {
  params: Promise<{ profile_id: UUID }>;
}) {
  const [prompt, setPrompt] = useState<string>(
    "Extract the measurement value from the text."
  );
  const [examples, setExamples] = useState<
    Array<{ input: string; output: string }>
  >([
    { input: "The profile depth is 22 mm", output: "22 mm" },
    { input: "Width measurement: 15 cm", output: "15 cm" },
  ]);
  const [testInput, setTestInput] = useState<string>("");
  const [testOutput, setTestOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("train");

  const addExample = () => {
    setExamples([...examples, { input: "", output: "" }]);
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

  //   const testExtraction = async () => {
  //     if (!testInput) return;

  //     setIsLoading(true);
  //     try {
  //       // Format the examples for the model
  //       const formattedExamples = examples
  //         .filter((ex) => ex.input && ex.output)
  //         .map((ex) => `Input: "${ex.input}"\nOutput: "${ex.output}"`)
  //         .join("\n\n");

  //       // Create the full prompt with instructions and examples
  //       const fullPrompt = `${prompt}\n\nHere are some examples:\n\n${formattedExamples}\n\nNow extract from this new input:\nInput: "${testInput}"\nOutput:`;

  //       // Call the AI model using the AI SDK
  //       const { text } = await generateText({
  //         model: openai("gpt-4o"),
  //         prompt: fullPrompt,
  //       });

  //       // Clean up the response
  //       const cleanedOutput = text.replace(/^"(.*)"$/, "$1").trim();
  //       setTestOutput(cleanedOutput);
  //     } catch (error) {
  //       console.error("Error testing extraction:", error);
  //       setTestOutput("Error: Failed to process your request");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   const saveTrainingData = () => {
  //     const data = {
  //       prompt,
  //       examples,
  //       timestamp: new Date().toISOString(),
  //     };

  //     // Save to localStorage for demonstration
  //     localStorage.setItem("extractionTrainingData", JSON.stringify(data));

  //     // In a real app, you might want to save to a database
  //     alert("Training data saved successfully!");
  //   };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">AI String Extraction Trainer</h1>
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
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                        onChange={(e) =>
                          updateExample(index, "input", e.target.value)
                        }
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
              <Button onClick={() => {}}>
                <Save className="mr-2 h-4 w-4" /> Save Training Data
              </Button>
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
                  onClick={() => {}}
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
}
