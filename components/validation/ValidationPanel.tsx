"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { useData } from "@/lib/contexts/DataContext";
import { useValidation } from "@/lib/contexts/ValidationContext";
import { ValidationErrorList } from "./ValidationErrorList";
import { AIValidationSuggestions } from "./AIValidationSuggestions";
import { runAllValidations } from "@/lib/utils/validators";

export function ValidationPanel() {
  const { clients, workers, tasks } = useData();
  const { errors, setErrors, isValidating, setIsValidating } = useValidation();
  const [validationProgress, setValidationProgress] = useState(0);

  const errorCount = errors.filter((e) => e.type === "error").length;
  const warningCount = errors.filter((e) => e.type === "warning").length;

  const runValidation = async () => {
    setIsValidating(true);
    setValidationProgress(0);

    try {
      // Simulate progressive validation
      const progressSteps = [
        { step: 10, message: "Checking required columns..." },
        { step: 25, message: "Validating IDs and duplicates..." },
        { step: 40, message: "Checking data integrity..." },
        { step: 60, message: "Validating relationships..." },
        { step: 80, message: "Running AI analysis..." },
        { step: 100, message: "Validation complete!" },
      ];

      for (const { step } of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setValidationProgress(step);
      }

      const validationResults = runAllValidations({ clients, workers, tasks });
      setErrors(validationResults);
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-run validation when data changes
  useEffect(() => {
    if (clients.length > 0 || workers.length > 0 || tasks.length > 0) {
      runValidation();
    }
  }, [clients.length, workers.length, tasks.length]);

  const getValidationStatus = () => {
    if (isValidating) return "validating";
    if (errorCount > 0) return "error";
    if (warningCount > 0) return "warning";
    if (clients.length === 0 && workers.length === 0 && tasks.length === 0)
      return "empty";
    return "success";
  };

  const status = getValidationStatus();

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Data Validation Dashboard</span>
            </div>
            <Button
              onClick={runValidation}
              disabled={isValidating}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`}
              />
              {isValidating ? "Validating..." : "Run Validation"}
            </Button>
          </CardTitle>
          <CardDescription>
            Comprehensive validation with 12+ rules plus AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValidating && (
            <div className="mb-6 space-y-2">
              <Progress value={validationProgress} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                Running comprehensive validation... {validationProgress}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Records</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {clients.length + workers.length + tasks.length}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg ${
                errorCount > 0 ? "bg-red-50" : "bg-green-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <XCircle
                  className={`h-5 w-5 ${
                    errorCount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                />
                <span className="font-medium">Errors</span>
              </div>
              <p
                className={`text-2xl font-bold mt-1 ${
                  errorCount > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {errorCount}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg ${
                warningCount > 0 ? "bg-yellow-50" : "bg-green-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    warningCount > 0 ? "text-yellow-600" : "text-green-600"
                  }`}
                />
                <span className="font-medium">Warnings</span>
              </div>
              <p
                className={`text-2xl font-bold mt-1 ${
                  warningCount > 0 ? "text-yellow-600" : "text-green-600"
                }`}
              >
                {warningCount}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg ${
                status === "success" ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle
                  className={`h-5 w-5 ${
                    status === "success" ? "text-green-600" : "text-gray-400"
                  }`}
                />
                <span className="font-medium">Status</span>
              </div>
              <Badge
                variant={
                  status === "success"
                    ? "default"
                    : status === "error"
                    ? "destructive"
                    : "secondary"
                }
                className="mt-1"
              >
                {status === "success"
                  ? "All Clear"
                  : status === "error"
                  ? "Needs Attention"
                  : status === "warning"
                  ? "Minor Issues"
                  : status === "validating"
                  ? "Validating..."
                  : "No Data"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Details */}
      <Tabs defaultValue="errors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="errors" className="flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>Issues ({errorCount + warningCount})</span>
          </TabsTrigger>
          <TabsTrigger
            value="suggestions"
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Suggestions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="mt-6">
          <ValidationErrorList />
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <AIValidationSuggestions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
