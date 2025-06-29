"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Save, X, AlertTriangle, Loader2 } from "lucide-react";
import { useData, Client, Worker, Task } from "@/lib/contexts/DataContext";
import {
  useValidation,
  ValidationError,
} from "@/lib/contexts/ValidationContext";
import { runAllValidations } from "@/lib/utils/validators";

interface DataGridProps {
  data: Client[] | Worker[] | Task[];
  type: "clients" | "workers" | "tasks";
}

export function DataGrid({ data, type }: DataGridProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const { updateClient, updateWorker, updateTask, clients, workers, tasks } =
    useData();
  const { errors, setErrors, setIsValidating, isValidating } = useValidation();

  const getFieldsForType = (type: string) => {
    switch (type) {
      case "clients":
        return [
          "ClientID",
          "ClientName",
          "PriorityLevel",
          "RequestedTaskIDs",
          "GroupTag",
          "AttributesJSON",
        ];
      case "workers":
        return [
          "WorkerID",
          "WorkerName",
          "Skills",
          "AvailableSlots",
          "MaxLoadPerPhase",
          "WorkerGroup",
          "QualificationLevel",
        ];
      case "tasks":
        return [
          "TaskID",
          "TaskName",
          "Category",
          "Duration",
          "RequiredSkills",
          "PreferredPhases",
          "MaxConcurrent",
        ];
      default:
        return [];
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingData(data[index]);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingData({});
  };

  const saveChanges = async () => {
    if (editingIndex === null) return;

    try {
      // First update the data
      switch (type) {
        case "clients":
          updateClient(editingIndex, editingData);
          break;
        case "workers":
          updateWorker(editingIndex, editingData);
          break;
        case "tasks":
          updateTask(editingIndex, editingData);
          break;
      }

      setEditingIndex(null);
      setEditingData({});
      toast.success("Changes saved successfully");

      // Then trigger validation with the updated data
      setIsValidating(true);

      // Create the updated data context for validation
      const updatedDataContext = {
        clients:
          type === "clients"
            ? data.map((d, i) => (i === editingIndex ? editingData : d))
            : clients,
        workers:
          type === "workers"
            ? data.map((d, i) => (i === editingIndex ? editingData : d))
            : workers,
        tasks:
          type === "tasks"
            ? data.map((d, i) => (i === editingIndex ? editingData : d))
            : tasks,
      };

      // Run validation with timeout to prevent hanging
      const validationPromise = new Promise<ValidationError[]>(
        (resolve, reject) => {
          try {
            // console.log(
            //   "Starting validation for",
            //   type,
            //   "with data:",
            //   updatedDataContext
            // );
            const results = runAllValidations(updatedDataContext);
            // console.log("Validation completed with", results.length, "errors");
            resolve(results);
          } catch (error) {
            console.error("Validation error in promise:", error);
            reject(error);
          }
        }
      );

      // Add timeout of 5 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          // console.log(
          //   "Validation timeout after 5 seconds - this is normal for large datasets"
          // );
          reject(new Error("Validation timeout"));
        }, 5000);
      });

      try {
        const validationResults = await Promise.race([
          validationPromise,
          timeoutPromise,
        ]);
        setErrors(validationResults);
        // console.log(
        //   "Validation results set:",
        //   validationResults.length,
        //   "errors"
        // );
      } catch (validationError) {
        console.error("Validation error:", validationError);
        if (
          validationError instanceof Error &&
          validationError.message === "Validation timeout"
        ) {
          toast.error("Validation timed out, but changes were saved");
        } else {
          toast.error("Validation failed, but changes were saved");
        }
      } finally {
        // console.log(
        //   "Validation process completed, setting isValidating to false"
        // );
        setIsValidating(false);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save changes");
      setIsValidating(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingData((prev: any) => ({ ...prev, [field]: value }));
  };

  const formatValue = (value: any, field: string): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return String(value || "");
  };

  const parseValue = (value: string, field: string): any => {
    // Handle arrays
    if (
      field.includes("IDs") ||
      field.includes("Skills") ||
      field.includes("Slots") ||
      field.includes("Phases")
    ) {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
    }

    // Handle numbers
    if (
      field.includes("Level") ||
      field.includes("Duration") ||
      field.includes("Load") ||
      field.includes("Concurrent")
    ) {
      return parseInt(value) || 0;
    }

    return value;
  };

  const getRowErrors = (index: number) => {
    return errors.filter(
      (error) => error.entity === type && error.rowIndex === index
    );
  };

  const fields = getFieldsForType(type);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">No data uploaded</h3>
            <p className="text-sm">Upload a file to view and edit your data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {type.charAt(0).toUpperCase() + type.slice(1)} Data ({data.length}{" "}
            records)
          </span>
          <div className="flex items-center space-x-2">
            {isValidating && (
              <div className="flex items-center space-x-1 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Validating...</span>
              </div>
            )}
            <Badge variant="outline">Live Editing Enabled</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Actions</th>
                {fields.map((field) => (
                  <th key={field} className="border p-2 text-left min-w-32">
                    {field}
                  </th>
                ))}
                <th className="border p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, index) => {
                const rowErrors = getRowErrors(index);
                const isEditing = editingIndex === index;

                return (
                  <tr
                    key={index}
                    className={rowErrors.length > 0 ? "bg-red-50" : ""}
                  >
                    <td className="border p-2">
                      {isEditing ? (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={saveChanges}
                            disabled={isValidating}
                          >
                            {isValidating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            disabled={isValidating}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(index)}
                          disabled={isValidating}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </td>

                    {fields.map((field) => (
                      <td key={field} className="border p-2">
                        {isEditing ? (
                          <Input
                            value={formatValue(
                              editingData[field] || row[field],
                              field
                            )}
                            onChange={(e) =>
                              updateField(
                                field,
                                parseValue(e.target.value, field)
                              )
                            }
                            className={
                              rowErrors.some((err) => err.column === field)
                                ? "border-red-500"
                                : ""
                            }
                          />
                        ) : (
                          <span
                            className={
                              rowErrors.some((err) => err.column === field)
                                ? "text-red-600"
                                : ""
                            }
                          >
                            {formatValue(row[field], field)}
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="border p-2">
                      {rowErrors.length > 0 ? (
                        <Badge variant="destructive">
                          {rowErrors.length} errors
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          Valid
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
