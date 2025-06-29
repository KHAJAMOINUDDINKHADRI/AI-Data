"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Search, Filter, Loader2 } from "lucide-react";
import { useData } from "@/lib/contexts/DataContext";
import { processNaturalLanguageQuery } from "@/lib/utils/naturalLanguageProcessor";
import { toast } from "sonner";

export function NaturalLanguageSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [resultType, setResultType] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const { clients, workers, tasks, setClients, setWorkers, setTasks } =
    useData();

  const handleSearch = async () => {
    if (typeof window === "undefined") return;
    if (!query.trim()) return;
    setIsSearching(true);

    // Check if we have any data to search
    const totalData = clients.length + workers.length + tasks.length;
    if (totalData === 0) {
      toast.error(
        "No data available to search. Please upload some data first."
      );
      setIsSearching(false);
      return;
    }

    try {
      // Prepare messages for the API route with actual data
      const messages = [
        {
          role: "system",
          content: `You are an expert data analyst for a resource allocation system. Your job is to search through the provided data and return matching records.

IMPORTANT INSTRUCTIONS:
1. You will receive actual data records for clients, workers, and tasks
2. Search through this data based on the user's query
3. Return ONLY records that match the search criteria
4. Always respond with valid JSON in this exact format:
{
  "results": [array of matching records from the data],
  "type": "clients|workers|tasks",
  "explanation": "brief explanation of what was searched and found"
}

Data structure:
- Clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON
- Workers: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel  
- Tasks: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent

Search examples:
- "high priority clients" → find clients with PriorityLevel >= 4
- "workers with Java skills" → find workers where Skills array contains "Java"
- "tasks lasting more than 3 phases" → find tasks where Duration > 3
- "workers available in phase 2" → find workers where AvailableSlots array contains 2`,
        },
        {
          role: "user",
          content: `Search query: "${query}"

Available data:
CLIENTS (${clients.length} records):
${JSON.stringify(clients, null, 2)}

WORKERS (${workers.length} records):
${JSON.stringify(workers, null, 2)}

TASKS (${tasks.length} records):
${JSON.stringify(tasks, null, 2)}

Search through this exact data and return matching records based on: "${query}"

Respond with JSON only, no other text.`,
        },
      ];

      // console.log("Sending search request with data:", {
      //   query,
      //   clientsCount: clients.length,
      //   workersCount: workers.length,
      //   tasksCount: tasks.length,
      // });

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiResult = await response.json();
      // console.log("AI response received:", aiResult);

      if (aiResult.success && aiResult.data) {
        // Try to parse the AI response as JSON
        let parsedResponse;
        try {
          // Clean up the response - remove markdown code blocks if present
          let cleanData = aiResult.data;
          if (cleanData.includes("```json")) {
            cleanData = cleanData
              .replace(/```json\n?/g, "")
              .replace(/```\n?/g, "");
          }
          if (cleanData.includes("```")) {
            cleanData = cleanData.replace(/```\n?/g, "");
          }

          parsedResponse = JSON.parse(cleanData);
          // console.log("Parsed AI response:", parsedResponse);
        } catch (parseError) {
          // console.log("AI response was not JSON, using fallback processing");
          // console.log("Raw AI response:", aiResult.data);
          // Fallback to basic processing
          const fallbackResult = processNaturalLanguageQuery(query, {
            clients,
            workers,
            tasks,
          });
          setResults(fallbackResult.results || []);
          setResultType(fallbackResult.type || "");
          setExplanation(
            fallbackResult.explanation ||
              "Search completed using fallback processing"
          );
          toast.success(
            `Found ${
              fallbackResult.results?.length || 0
            } results using fallback processing`
          );
          return;
        }

        setResults(parsedResponse.results || []);
        setResultType(parsedResponse.type || "");
        setExplanation(parsedResponse.explanation || "Search completed");
        toast.success(`Found ${parsedResponse.results?.length || 0} results`);
      } else {
        throw new Error(aiResult.error || "AI search failed");
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast.error(
        `Search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // Fallback to basic processing on error
      try {
        const fallbackResult = processNaturalLanguageQuery(query, {
          clients,
          workers,
          tasks,
        });
        setResults(fallbackResult.results || []);
        setResultType(fallbackResult.type || "");
        setExplanation(
          fallbackResult.explanation ||
            "Search completed using fallback processing"
        );
        toast.info("Using fallback search method");
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError);
        setResults([]);
        setResultType("");
        setExplanation("Search failed completely");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const exampleQueries = [
    "Show all high priority clients",
    "Find workers with programming skills",
    "Tasks lasting more than 3 phases",
    "Workers available in phase 1 and 2",
    "Clients requesting task T001",
    "Tasks requiring multiple skills",
    "Workers in the senior group with Java skills",
    "High priority clients with enterprise group tag",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>Natural Language Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Ask anything about your data... e.g., 'Show me all workers with Java skills available in phase 2'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Try these examples:</span>
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(example)}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>

            {explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>AI Analysis:</strong> {explanation}
                </p>
              </div>
            )}

            {/* Debug panel to show data status */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Data Status:</strong>
              </p>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium">Clients:</span> {clients.length}{" "}
                  records
                </div>
                <div>
                  <span className="font-medium">Workers:</span> {workers.length}{" "}
                  records
                </div>
                <div>
                  <span className="font-medium">Tasks:</span> {tasks.length}{" "}
                  records
                </div>
              </div>
              {clients.length === 0 &&
                workers.length === 0 &&
                tasks.length === 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-red-600">
                      ⚠️ No data loaded. Please upload CSV files first.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Load sample data for testing
                        const sampleClients = [
                          {
                            ClientID: "C001",
                            ClientName: "TechCorp",
                            PriorityLevel: 5,
                            RequestedTaskIDs: ["T001", "T002"],
                            GroupTag: "enterprise",
                            AttributesJSON: '{"industry": "technology"}',
                          },
                          {
                            ClientID: "C002",
                            ClientName: "StartupXYZ",
                            PriorityLevel: 3,
                            RequestedTaskIDs: ["T003"],
                            GroupTag: "startup",
                            AttributesJSON: '{"industry": "fintech"}',
                          },
                        ];
                        const sampleWorkers = [
                          {
                            WorkerID: "W001",
                            WorkerName: "John Doe",
                            Skills: ["Java", "Python", "JavaScript"],
                            AvailableSlots: [1, 2, 3],
                            MaxLoadPerPhase: 2,
                            WorkerGroup: "senior",
                            QualificationLevel: 5,
                          },
                          {
                            WorkerID: "W002",
                            WorkerName: "Jane Smith",
                            Skills: ["Python", "Data Analysis"],
                            AvailableSlots: [2, 3, 4],
                            MaxLoadPerPhase: 1,
                            WorkerGroup: "junior",
                            QualificationLevel: 3,
                          },
                        ];
                        const sampleTasks = [
                          {
                            TaskID: "T001",
                            TaskName: "Web Development",
                            Category: "Development",
                            Duration: 5,
                            RequiredSkills: ["JavaScript", "React"],
                            PreferredPhases: [1, 2],
                            MaxConcurrent: 2,
                          },
                          {
                            TaskID: "T002",
                            TaskName: "Data Analysis",
                            Category: "Analytics",
                            Duration: 3,
                            RequiredSkills: ["Python", "Data Analysis"],
                            PreferredPhases: [2, 3],
                            MaxConcurrent: 1,
                          },
                        ];

                        setClients(sampleClients);
                        setWorkers(sampleWorkers);
                        setTasks(sampleTasks);
                        toast.success("Sample data loaded for testing!");
                      }}
                    >
                      Load Sample Data for Testing
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="outline">
                <Filter className="h-3 w-3 mr-1" />
                {results.length} {resultType} found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {results.length > 0 &&
                      Object.keys(results[0]).map((key) => (
                        <th key={key} className="border p-2 text-left">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="border p-2">
                          {Array.isArray(value)
                            ? value.join(", ")
                            : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
