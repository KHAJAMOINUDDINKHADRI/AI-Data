"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRules } from "@/lib/contexts/RulesContext";
import { useData } from "@/lib/contexts/DataContext";
import { toast } from "sonner";

export function NaturalLanguageRules() {
  const [ruleText, setRuleText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedRule, setParsedRule] = useState<any>(null);

  // Check if RulesProvider is available
  let addRule: any;
  let rulesContext;

  try {
    rulesContext = useRules();
    addRule = rulesContext.addRule;
  } catch (error) {
    console.error("RulesProvider not available:", error);
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-400 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">
              Rules Provider Not Available
            </h3>
            <p className="text-sm">
              Please ensure the RulesProvider is properly configured
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { clients, workers, tasks } = useData();

  const exampleRules = [
    "Tasks T001 and T002 must always run together",
    "Workers in the 'senior' group can only work a maximum of 3 slots per phase",
    "Task T003 can only be executed in phases 1, 2, or 3",
    "No more than 2 workers from the 'junior' group should work in the same phase",
    "High priority clients (level 4-5) should be assigned before others",
    "Tasks requiring Java skills must run in phases 2-4",
    "Client group 'enterprise' should have precedence over 'standard' clients",
  ];

  const processNaturalLanguageRule = async (text: string) => {
    setIsProcessing(true);
    setParsedRule(null);

    try {
      console.log("Processing natural language rule:", text);

      const context = {
        clients: clients.slice(0, 5),
        workers: workers.slice(0, 5),
        tasks: tasks.slice(0, 5),
      };

      console.log("Context data:", {
        clientsCount: context.clients.length,
        workersCount: context.workers.length,
        tasksCount: context.tasks.length,
      });

      const messages = [
        {
          role: "system",
          content: `You are an expert business rule parser for a resource allocation system. 
          
          Your job is to parse natural language descriptions of business rules and convert them into structured rule objects.
          
          Available rule types:
          - coRun: Tasks that must run together
          - loadLimit: Maximum slots per phase for worker groups
          - phaseWindow: Restrict tasks to specific phases
          - slotRestriction: Limit common slots for groups
          - precedence: Priority-based rule ordering
          - patternMatch: Regex-based rule matching
          
          Available data context:
          - Clients: ${clients.length} records with fields: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag
          - Workers: ${workers.length} records with fields: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup
          - Tasks: ${tasks.length} records with fields: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases
          
          Respond with a JSON object in this exact format:
          {
            "ruleType": "coRun|loadLimit|phaseWindow|slotRestriction|precedence|patternMatch",
            "name": "Descriptive rule name",
            "description": "Original rule description",
            "parameters": {object with rule-specific parameters},
            "confidence": 0.0-1.0,
            "reasoning": "Brief explanation of how you parsed this rule"
          }`,
        },
        {
          role: "user",
          content: `Parse this business rule: "${text}"
          
          Available data for reference:
          CLIENTS: ${JSON.stringify(context.clients, null, 2)}
          WORKERS: ${JSON.stringify(context.workers, null, 2)}
          TASKS: ${JSON.stringify(context.tasks, null, 2)}
          
          Return only the JSON object, no other text.`,
        },
      ];

      console.log("Sending request to AI with messages:", messages);

      const aiResponse = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      console.log("AI response status:", aiResponse.status);

      if (!aiResponse.ok) {
        throw new Error(`HTTP error! status: ${aiResponse.status}`);
      }

      const data = await aiResponse.json();
      console.log("AI response data:", data);

      if (data.success && data.data) {
        // Clean up the response - remove markdown code blocks if present
        let cleanData = data.data;
        if (cleanData.includes("```json")) {
          cleanData = cleanData
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "");
        }
        if (cleanData.includes("```")) {
          cleanData = cleanData.replace(/```\n?/g, "");
        }

        console.log("Cleaned AI response:", cleanData);

        const parsed = JSON.parse(cleanData);
        console.log("Parsed rule:", parsed);

        setParsedRule(parsed);
        toast.success("Rule parsed successfully!");
      } else {
        throw new Error(data.error || "Failed to parse rule");
      }
    } catch (error) {
      console.error("Rule parsing error:", error);
      toast.error(
        "Failed to parse rule. Please try rephrasing or use a simpler format."
      );

      // Fallback to basic parsing
      const fallbackRule = parseRuleBasic(text);
      if (fallbackRule) {
        setParsedRule(fallbackRule);
        toast.info("Using basic rule parsing as fallback");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const parseRuleBasic = (text: string) => {
    const lowerText = text.toLowerCase();

    // Basic pattern matching for common rule types
    if (lowerText.includes("run together") || lowerText.includes("co-run")) {
      const taskMatches = text.match(/T\d+/g);
      if (taskMatches && taskMatches.length >= 2) {
        return {
          ruleType: "coRun",
          name: `Co-run rule: ${taskMatches.join(", ")}`,
          description: text,
          parameters: { tasks: taskMatches },
          confidence: 0.7,
          reasoning: "Detected co-run pattern with task IDs",
        };
      }
    }

    if (lowerText.includes("maximum") && lowerText.includes("slots")) {
      const groupMatch = text.match(/'([^']+)'\s+group/);
      const numberMatch = text.match(/(\d+)\s+slots/);
      if (groupMatch && numberMatch) {
        return {
          ruleType: "loadLimit",
          name: `Load limit for ${groupMatch[1]} group`,
          description: text,
          parameters: {
            workerGroup: groupMatch[1],
            maxSlots: parseInt(numberMatch[1]),
          },
          confidence: 0.8,
          reasoning: "Detected load limit pattern with group and number",
        };
      }
    }

    if (lowerText.includes("only") && lowerText.includes("phase")) {
      const taskMatch = text.match(/Task\s+(T\d+)/i);
      const phaseMatches = text.match(/phase[s]?\s+([0-9,\s\-]+)/i);
      if (taskMatch && phaseMatches) {
        const phaseStr = phaseMatches[1];
        let phases: number[] = [];

        if (phaseStr.includes("-")) {
          const [start, end] = phaseStr
            .split("-")
            .map((p) => parseInt(p.trim()));
          phases = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        } else {
          phases = phaseStr
            .split(",")
            .map((p) => parseInt(p.trim()))
            .filter((p) => !isNaN(p));
        }

        return {
          ruleType: "phaseWindow",
          name: `Phase window for ${taskMatch[1]}`,
          description: text,
          parameters: {
            taskId: taskMatch[1],
            phases,
          },
          confidence: 0.75,
          reasoning: "Detected phase window pattern with task and phases",
        };
      }
    }

    return null;
  };

  const acceptRule = () => {
    if (!parsedRule) return;

    console.log("Accepting rule:", parsedRule);

    // Map AI response to expected rule format
    const rule = {
      id: `nl-rule-${Date.now()}`,
      type: parsedRule.ruleType,
      name: parsedRule.name,
      description: parsedRule.description,
      parameters: parsedRule.parameters,
      enabled: true,
      priority: parsedRule.confidence > 0.8 ? 7 : 5,
    };

    console.log("Created rule object:", rule);

    try {
      addRule(rule);
      console.log("Rule added successfully");
      setParsedRule(null);
      setRuleText("");
      toast.success("Rule added successfully");
    } catch (error) {
      console.error("Error adding rule:", error);
      toast.error("Failed to add rule. Please try again.");
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 0.6)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span>Natural Language Rule Creator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your rule in plain English
            </label>
            <Textarea
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              placeholder="e.g., Tasks T001 and T002 must always run together"
              className="min-h-24"
            />
          </div>

          <Button
            onClick={() => processNaturalLanguageRule(ruleText)}
            disabled={!ruleText.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing with DeepSeek AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Convert to Rule with AI
              </>
            )}
          </Button>

          <div className="text-sm text-gray-600">
            <strong>Try these examples:</strong>
            <div className="mt-2 space-y-2">
              {exampleRules.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setRuleText(example)}
                  className="text-xs mr-2 mb-2"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parsed Rule Preview */}
      {parsedRule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getConfidenceIcon(parsedRule.confidence)}
                <span>AI Rule Interpretation</span>
              </div>
              <Badge variant="outline">
                {Math.round(parsedRule.confidence * 100)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-4 rounded-lg border-l-4 ${getConfidenceColor(
                parsedRule.confidence
              )}`}
            >
              <div className="flex items-start space-x-2">
                {getConfidenceIcon(parsedRule.confidence)}
                <div>
                  <h4 className="font-medium">Interpreted Rule</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    {parsedRule.description}
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{parsedRule.ruleType}</Badge>
                      <span className="text-xs text-gray-500">Rule Type</span>
                    </div>

                    {Object.keys(parsedRule.parameters).length > 0 && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Parameters:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {JSON.stringify(parsedRule.parameters, null, 2)}
                        </pre>
                      </div>
                    )}

                    {parsedRule.reasoning && (
                      <div className="text-xs text-gray-600">
                        <strong>AI Reasoning:</strong> {parsedRule.reasoning}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={acceptRule}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept & Add Rule
              </Button>
              <Button variant="outline" onClick={() => setParsedRule(null)}>
                Reject
              </Button>
              {parsedRule.confidence < 0.8 && (
                <Button
                  variant="outline"
                  onClick={() => processNaturalLanguageRule(ruleText)}
                  disabled={isProcessing}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Reprocess
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
