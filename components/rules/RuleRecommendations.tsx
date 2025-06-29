"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Target,
  CheckCircle,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useData } from "@/lib/contexts/DataContext";
import { useRules } from "@/lib/contexts/RulesContext";
import { toast } from "sonner";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  ruleType: string;
  parameters: any;
  confidence: number;
  impact: "high" | "medium" | "low";
  icon: any;
}

export function RuleRecommendations() {
  const { clients, workers, tasks } = useData();
  const { addRule } = useRules();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (clients.length > 0 || workers.length > 0 || tasks.length > 0) {
      generateRecommendations();
    }
  }, [clients.length, workers.length, tasks.length]);

  const generateRecommendations = async () => {
    setIsGenerating(true);

    try {
      console.log("Generating AI recommendations with data:", {
        clientsCount: clients.length,
        workersCount: workers.length,
        tasksCount: tasks.length,
      });

      // Prepare messages for AI analysis
      const messages = [
        {
          role: "system",
          content: `You are an expert resource allocation analyst. Your job is to analyze data and suggest business rules that would improve resource allocation efficiency.

Available rule types:
- coRun: Tasks that must run together
- loadLimit: Maximum slots per phase for worker groups  
- phaseWindow: Restrict tasks to specific phases
- slotRestriction: Limit common slots for groups
- precedence: Priority-based rule ordering
- patternMatch: Regex-based rule matching

Analyze the provided data and suggest 3-5 business rules that would improve efficiency.

Respond with a JSON array of recommendations in this format:
[
  {
    "id": "unique-id",
    "title": "Rule Title",
    "description": "Brief description",
    "reasoning": "Why this rule would help",
    "ruleType": "coRun|loadLimit|phaseWindow|slotRestriction|precedence|patternMatch",
    "parameters": {rule-specific parameters},
    "confidence": 0.0-1.0,
    "impact": "high|medium|low"
  }
]`,
        },
        {
          role: "user",
          content: `Analyze this resource allocation data and suggest business rules:

CLIENTS (${clients.length} records):
${JSON.stringify(clients, null, 2)}

WORKERS (${workers.length} records):
${JSON.stringify(workers, null, 2)}

TASKS (${tasks.length} records):
${JSON.stringify(tasks, null, 2)}

Suggest 3-5 business rules that would improve resource allocation efficiency. Return only the JSON array.`,
        },
      ];

      console.log("Sending AI recommendation request with messages");

      // Use AI service for intelligent recommendations
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

        const aiRecommendations = JSON.parse(cleanData);
        console.log("Parsed AI recommendations:", aiRecommendations);

        const processedRecs = aiRecommendations.map((rec: any) => ({
          ...rec,
          icon: getIconForRuleType(rec.ruleType),
        }));

        setRecommendations(
          processedRecs.filter((r: any) => !dismissedIds.has(r.id))
        );
        toast.success(`Generated ${processedRecs.length} AI recommendations`);
      } else {
        throw new Error(data.error || "Failed to generate recommendations");
      }
    } catch (error) {
      console.error("AI recommendation generation failed:", error);
      toast.error("AI recommendations unavailable, using fallback analysis");

      // Fallback to basic pattern analysis
      const fallbackRecs = generateBasicRecommendations();
      setRecommendations(fallbackRecs.filter((r) => !dismissedIds.has(r.id)));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBasicRecommendations = (): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Analyze for co-run opportunities
    const tasksByClient = clients.reduce((acc, client) => {
      const tasks = client.RequestedTaskIDs || [];
      if (tasks.length > 1) {
        acc.push({ client: client.ClientName, tasks });
      }
      return acc;
    }, [] as any[]);

    if (tasksByClient.length > 0) {
      const firstClientTasks = tasksByClient[0];
      recs.push({
        id: "corun-suggestion-1",
        title: "Co-run Tasks Detected",
        description: `Client "${firstClientTasks.client}" requests multiple tasks that could benefit from co-running`,
        reasoning:
          "Tasks requested by the same client often have dependencies and should run together",
        ruleType: "coRun",
        parameters: { tasks: firstClientTasks.tasks },
        confidence: 0.85,
        impact: "high",
        icon: Target,
      });
    }

    // Worker group load balancing
    const workerGroups = workers.reduce((acc, worker) => {
      const group = worker.WorkerGroup || "default";
      if (!acc[group]) acc[group] = [];
      acc[group].push(worker);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(workerGroups).forEach(([group, groupWorkers]) => {
      if (groupWorkers.length > 3) {
        const avgSlots =
          groupWorkers.reduce(
            (sum, w) => sum + (w.AvailableSlots?.length || 0),
            0
          ) / groupWorkers.length;
        if (avgSlots > 2) {
          recs.push({
            id: `load-limit-${group}`,
            title: `Load Limit for ${group} Group`,
            description: `${group} group has ${groupWorkers.length} workers with high availability`,
            reasoning:
              "Large worker groups with high availability may become overloaded without limits",
            ruleType: "loadLimit",
            parameters: {
              workerGroup: group,
              maxSlots: Math.ceil(avgSlots * 0.8),
            },
            confidence: 0.75,
            impact: "medium",
            icon: Users,
          });
        }
      }
    });

    // High priority optimization
    const highPriorityClients = clients.filter((c) => c.PriorityLevel >= 4);
    if (
      highPriorityClients.length > 0 &&
      highPriorityClients.length < clients.length * 0.3
    ) {
      recs.push({
        id: "priority-precedence",
        title: "Priority Precedence Rule",
        description: `${highPriorityClients.length} high-priority clients need preferential treatment`,
        reasoning:
          "High-priority clients should be allocated resources before lower-priority ones",
        ruleType: "precedence",
        parameters: {
          condition: "PriorityLevel >= 4",
          priority: 10,
        },
        confidence: 0.92,
        impact: "high",
        icon: TrendingUp,
      });
    }

    return recs;
  };

  const getIconForRuleType = (ruleType: string) => {
    switch (ruleType) {
      case "coRun":
        return Target;
      case "loadLimit":
        return Users;
      case "phaseWindow":
        return Clock;
      case "precedence":
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  const acceptRecommendation = (rec: Recommendation) => {
    console.log("Accepting recommendation:", rec);

    const rule = {
      id: `rec-${rec.id}`,
      type: rec.ruleType as any,
      name: rec.title,
      description: rec.description,
      parameters: rec.parameters,
      enabled: true,
      priority: rec.impact === "high" ? 8 : rec.impact === "medium" ? 5 : 3,
    };

    console.log("Created rule from recommendation:", rule);

    addRule(rule);
    console.log("Rule added successfully from recommendation");
    dismissRecommendation(rec.id);
    toast.success("Rule added from AI recommendation");
  };

  const dismissRecommendation = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-50 border-red-500 text-red-800";
      case "medium":
        return "bg-yellow-50 border-yellow-500 text-yellow-800";
      case "low":
        return "bg-blue-50 border-blue-500 text-blue-800";
      default:
        return "bg-gray-50 border-gray-500 text-gray-800";
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Generating AI Recommendations
          </h3>
          <p className="text-sm text-gray-600">
            DeepSeek AI is analyzing your data patterns...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No recommendations available
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload more data to get AI-powered rule recommendations
          </p>
          <Button onClick={generateRecommendations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Rule Recommendations</h3>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {recommendations.length} suggestion
            {recommendations.length !== 1 ? "s" : ""}
          </Badge>
          <Button size="sm" variant="outline" onClick={generateRecommendations}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Card
            key={rec.id}
            className={`border-l-4 ${
              getImpactColor(rec.impact).split(" ")[1]
            } ${getImpactColor(rec.impact).split(" ")[2]}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <rec.icon className="h-6 w-6 mt-1 text-gray-600" />
                  <div>
                    <CardTitle className="text-base flex items-center space-x-2">
                      <span>{rec.title}</span>
                      <Badge variant={getImpactBadge(rec.impact) as any}>
                        {rec.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(rec.confidence * 100)}% confidence
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {rec.description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => acceptRecommendation(rec)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dismissRecommendation(rec.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <strong>AI Reasoning:</strong> {rec.reasoning}
                </div>

                <div className="text-xs text-gray-600">
                  <strong>Rule Type:</strong> {rec.ruleType} |
                  <strong> Parameters:</strong> {JSON.stringify(rec.parameters)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
