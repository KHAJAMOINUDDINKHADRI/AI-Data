"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, RotateCcw, Calculator } from "lucide-react";
import { useRules } from "@/lib/contexts/RulesContext";
import { toast } from "sonner";

interface Criterion {
  id: string;
  label: string;
  description: string;
}

interface Comparison {
  criterion1: Criterion;
  criterion2: Criterion;
  selected?: string;
  intensity: number; // 1-9 scale
}

export function PairwiseComparison() {
  const { setWeights } = useRules();

  const criteria: Criterion[] = [
    {
      id: "priorityLevel",
      label: "Priority Level",
      description: "Client priority levels",
    },
    {
      id: "taskFulfillment",
      label: "Task Fulfillment",
      description: "Completing requested tasks",
    },
    { id: "fairness", label: "Fairness", description: "Equal distribution" },
    {
      id: "workloadBalance",
      label: "Workload Balance",
      description: "Even work distribution",
    },
    {
      id: "skillMatching",
      label: "Skill Matching",
      description: "Skills match requirements",
    },
    {
      id: "phasePreference",
      label: "Phase Preference",
      description: "Preferred phases",
    },
  ];

  // Generate all pairwise comparisons
  const generateComparisons = (): Comparison[] => {
    const comparisons: Comparison[] = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        comparisons.push({
          criterion1: criteria[i],
          criterion2: criteria[j],
          intensity: 1,
        });
      }
    }
    return comparisons;
  };

  const [comparisons, setComparisons] = useState<Comparison[]>(
    generateComparisons()
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const intensityLabels = {
    1: "Equal importance",
    2: "Slightly more important",
    3: "Moderately more important",
    4: "Moderately to strongly more important",
    5: "Strongly more important",
    6: "Strongly to very strongly more important",
    7: "Very strongly more important",
    8: "Very to extremely strongly more important",
    9: "Extremely more important",
  };

  const makeComparison = (selectedId: string, intensity: number) => {
    const newComparisons = [...comparisons];
    newComparisons[currentIndex] = {
      ...newComparisons[currentIndex],
      selected: selectedId,
      intensity,
    };
    setComparisons(newComparisons);

    if (currentIndex < comparisons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetComparisons = () => {
    setComparisons(generateComparisons());
    setCurrentIndex(0);
  };

  const calculateWeights = () => {
    // Simplified AHP calculation
    const n = criteria.length;
    const matrix: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(1));

    // Fill comparison matrix
    comparisons.forEach((comp) => {
      if (comp.selected) {
        const i = criteria.findIndex((c) => c.id === comp.criterion1.id);
        const j = criteria.findIndex((c) => c.id === comp.criterion2.id);

        if (comp.selected === comp.criterion1.id) {
          matrix[i][j] = comp.intensity;
          matrix[j][i] = 1 / comp.intensity;
        } else {
          matrix[j][i] = comp.intensity;
          matrix[i][j] = 1 / comp.intensity;
        }
      }
    });

    // Calculate weights using geometric mean method
    const weights: Record<string, number> = {};
    const geometricMeans = matrix.map((row) =>
      Math.pow(
        row.reduce((prod, val) => prod * val, 1),
        1 / n
      )
    );

    const sum = geometricMeans.reduce((total, mean) => total + mean, 0);

    criteria.forEach((criterion, index) => {
      weights[criterion.id] = Math.round((geometricMeans[index] / sum) * 100);
    });

    setWeights(weights as any);
    toast.success("Weights calculated from pairwise comparisons");
  };

  const completedComparisons = comparisons.filter((c) => c.selected).length;
  const progress = (completedComparisons / comparisons.length) * 100;
  const currentComparison = comparisons[currentIndex];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pairwise Comparison (AHP Method)</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {completedComparisons}/{comparisons.length}
              </Badge>
              <Button size="sm" variant="outline" onClick={resetComparisons}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {currentIndex < comparisons.length ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    Comparison {currentIndex + 1} of {comparisons.length}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Which criterion is more important for resource allocation?
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-2">
                      <h4 className="font-medium text-blue-900">
                        {currentComparison.criterion1.label}
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {currentComparison.criterion1.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                    <p className="text-xs text-gray-500 mt-1">vs</p>
                  </div>

                  <div className="text-center">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-2">
                      <h4 className="font-medium text-green-900">
                        {currentComparison.criterion2.label}
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        {currentComparison.criterion2.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">
                      Select the more important criterion:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4"
                      onClick={() =>
                        makeComparison(currentComparison.criterion1.id, 3)
                      }
                    >
                      <div className="text-center">
                        <div className="font-medium">
                          {currentComparison.criterion1.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          is more important
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4"
                      onClick={() =>
                        makeComparison(currentComparison.criterion2.id, 3)
                      }
                    >
                      <div className="text-center">
                        <div className="font-medium">
                          {currentComparison.criterion2.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          is more important
                        </div>
                      </div>
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        makeComparison(currentComparison.criterion1.id, 1)
                      }
                    >
                      They are equally important
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    All Comparisons Complete!
                  </h3>
                  <p className="text-sm text-green-700">
                    You've completed all pairwise comparisons. Click below to
                    calculate the final weights.
                  </p>
                </div>

                <Button onClick={calculateWeights} size="lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Final Weights
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Comparisons Summary */}
      {completedComparisons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Comparisons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comparisons
                .filter((c) => c.selected)
                .map((comp, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={
                          comp.selected === comp.criterion1.id
                            ? "font-medium"
                            : ""
                        }
                      >
                        {comp.criterion1.label}
                      </span>
                      <span className="text-gray-500">vs</span>
                      <span
                        className={
                          comp.selected === comp.criterion2.id
                            ? "font-medium"
                            : ""
                        }
                      >
                        {comp.criterion2.label}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {comp.intensity}:1
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
