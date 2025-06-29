"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Target,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useData } from "@/lib/contexts/DataContext";
import { useValidation } from "@/lib/contexts/ValidationContext";
import { toast } from "sonner";

interface AISuggestion {
  title: string;
  description: string;
  action: string;
  severity: "high" | "medium" | "low";
  category: string;
  icon: any;
}

export function AIValidationSuggestions() {
  const { clients, workers, tasks } = useData();
  const { errors } = useValidation();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (clients.length > 0 || workers.length > 0 || tasks.length > 0) {
      generateAISuggestions();
    }
  }, [clients.length, workers.length, tasks.length, errors.length]);

  const generateAISuggestions = async () => {
    setIsGenerating(true);

    try {
      console.log("Generating AI validation suggestions with data:", {
        clientsCount: clients.length,
        workersCount: workers.length,
        tasksCount: tasks.length,
        errorsCount: errors.length,
      });

      // Prepare messages for AI analysis
      const messages = [
        {
          role: "system",
          content: `You are an expert data validation analyst. Your job is to analyze resource allocation data and identify potential issues, gaps, and optimization opportunities.

Analyze the provided data and suggest validation insights that would improve data quality and resource allocation efficiency.

Respond with a JSON array of suggestions in this format:
[
  {
    "title": "Suggestion Title",
    "description": "Brief description of the issue or opportunity",
    "action": "Recommended action to take",
    "severity": "high|medium|low",
    "category": "skill_gap|workload|phase_balance|data_quality|optimization"
  }
]`,
        },
        {
          role: "user",
          content: `Analyze this resource allocation data and suggest validation insights:

CLIENTS (${clients.length} records):
${JSON.stringify(clients, null, 2)}

WORKERS (${workers.length} records):
${JSON.stringify(workers, null, 2)}

TASKS (${tasks.length} records):
${JSON.stringify(tasks, null, 2)}

VALIDATION ERRORS (${errors.length} records):
${JSON.stringify(errors, null, 2)}

Suggest 3-5 validation insights that would improve data quality and resource allocation efficiency. Return only the JSON array.`,
        },
      ];

      console.log("Sending AI validation suggestions request with messages");

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

        const aiSuggestions = JSON.parse(cleanData);
        console.log("Parsed AI suggestions:", aiSuggestions);

        const processedSuggestions = aiSuggestions.map((suggestion: any) => ({
          ...suggestion,
          icon: getIconForCategory(suggestion.category),
        }));

        setSuggestions(processedSuggestions);
        toast.success(`Generated ${processedSuggestions.length} AI insights`);
      } else {
        throw new Error(data.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error("AI suggestion generation failed:", error);

      // Fallback to basic analysis
      const fallbackSuggestions = generateBasicSuggestions();
      setSuggestions(fallbackSuggestions);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBasicSuggestions = (): AISuggestion[] => {
    const suggestions: AISuggestion[] = [];

    // Skill coverage analysis
    const allRequiredSkills = tasks.flatMap((t) => t.RequiredSkills || []);
    const allWorkerSkills = workers.flatMap((w) => w.Skills || []);
    const missingSkills = allRequiredSkills.filter(
      (skill) =>
        !allWorkerSkills.some((ws) =>
          ws.toLowerCase().includes(skill.toLowerCase())
        )
    );

    if (missingSkills.length > 0) {
      suggestions.push({
        icon: Users,
        title: "Skill Gap Detection",
        description: `Found ${missingSkills.length} required skills with no matching workers`,
        action: "Review skill requirements or add qualified workers",
        severity: "high",
        category: "skill_gap",
      });
    }

    // Workload distribution
    const highPriorityClients = clients.filter((c) => c.PriorityLevel >= 4);
    if (highPriorityClients.length > workers.length * 0.3) {
      suggestions.push({
        icon: TrendingUp,
        title: "High Priority Overload",
        description:
          "Many high-priority clients may overwhelm available workers",
        action: "Consider balancing priorities or adding capacity",
        severity: "medium",
        category: "workload",
      });
    }

    // Phase slot optimization
    const phaseSlots = workers.reduce((acc, w) => {
      (w.AvailableSlots || []).forEach((slot) => {
        acc[slot] = (acc[slot] || 0) + 1;
      });
      return acc;
    }, {} as Record<number, number>);

    const minSlots = Math.min(...Object.values(phaseSlots));
    const maxSlots = Math.max(...Object.values(phaseSlots));

    if (maxSlots > minSlots * 2) {
      suggestions.push({
        icon: Clock,
        title: "Phase Imbalance Detected",
        description:
          "Some phases have significantly more available workers than others",
        action: "Consider redistributing worker availability across phases",
        severity: "low",
        category: "phase_balance",
      });
    }

    // Task complexity analysis
    const complexTasks = tasks.filter(
      (t) => (t.RequiredSkills || []).length > 3
    );
    if (complexTasks.length > 0) {
      suggestions.push({
        icon: Target,
        title: "Complex Task Analysis",
        description: `${complexTasks.length} tasks require multiple specialized skills`,
        action: "Ensure sufficient cross-skilled workers are available",
        severity: "medium",
        category: "data_quality",
      });
    }

    return suggestions;
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "skill_gap":
        return Users;
      case "workload":
        return TrendingUp;
      case "phase_balance":
        return Clock;
      case "data_quality":
        return Target;
      default:
        return Sparkles;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
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
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>AI-Powered Data Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-purple-500 mx-auto mb-2 animate-spin" />
            <p className="text-gray-600">
              DeepSeek AI is analyzing your data...
            </p>
            <p className="text-sm text-gray-500">
              Generating intelligent insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>AI-Powered Data Insights</span>
          </div>
          <Button size="sm" variant="outline" onClick={generateAISuggestions}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No suggestions available</p>
            <p className="text-sm text-gray-500">
              Upload more data to get AI insights
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(
                  suggestion.severity
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <suggestion.icon className="h-5 w-5 mt-0.5 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <Badge
                          variant={getSeverityBadge(suggestion.severity) as any}
                        >
                          {suggestion.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {suggestion.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        💡 {suggestion.action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
