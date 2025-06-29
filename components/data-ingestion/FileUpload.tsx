"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useData } from "@/lib/contexts/DataContext";
import { parseCSVFile, parseXLSXFile } from "@/lib/utils/fileParser";
import { validateAndMapData } from "@/lib/utils/dataValidator";
import React from "react";

export function FileUpload() {
  const { setClients, setWorkers, setTasks } = useData();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    clients?: string;
    workers?: string;
    tasks?: string;
  }>({});

  const handleFileUpload = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      dataType: "clients" | "workers" | "tasks"
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        let data: any[] = [];

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        if (file.name.endsWith(".csv")) {
          data = await parseCSVFile(file);
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          data = await parseXLSXFile(file);
        } else {
          throw new Error(
            "Unsupported file format. Please use CSV or XLSX files."
          );
        }

        // console.log("Parsed data:", data);

        clearInterval(progressInterval);
        setUploadProgress(95);

        // Validate and map data with AI-like intelligence
        const mappedData = await validateAndMapData(data, dataType);
        // console.log("Mapped data:", mappedData);

        // Set data in context
        switch (dataType) {
          case "clients":
            setClients(mappedData);
            break;
          case "workers":
            setWorkers(mappedData);
            break;
          case "tasks":
            setTasks(mappedData);
            break;
        }
        // console.log("Data set in context for", dataType);

        setUploadProgress(100);
        setUploadedFiles((prev) => ({ ...prev, [dataType]: file.name }));

        toast.success(`${dataType} data uploaded successfully!`, {
          description: `Processed ${mappedData.length} records with intelligent column mapping`,
        });
      } catch (error) {
        toast.error("Upload failed", {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 2000);
      }
    },
    [setClients, setWorkers, setTasks]
  );

  const FileUploadCard = ({
    title,
    description,
    dataType,
  }: {
    title: string;
    description: string;
    dataType: "clients" | "workers" | "tasks";
  }) => {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleButtonClick = () => {
      if (fileInputRef.current) fileInputRef.current.click();
    };

    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            {uploadedFiles[dataType] && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Uploaded</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileUpload(e, dataType)}
              className="hidden"
              ref={fileInputRef}
              id={`upload-${dataType}`}
              disabled={isUploading}
            />
            <Button
              variant="outline"
              className="w-full h-12 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50"
              disabled={isUploading}
              onClick={handleButtonClick}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadedFiles[dataType] ? "Replace File" : "Upload CSV/XLSX"}
            </Button>

            {uploadedFiles[dataType] && (
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                📄 {uploadedFiles[dataType]}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-gray-600">
                  Processing with AI intelligence... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">
              AI-Powered Smart Parsing
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Our intelligent parser can automatically map columns even with
              different names or arrangements. Upload your files and let AI
              handle the complexity!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadCard
          title="Clients Data"
          description="ClientID, Name, Priority, Tasks, etc."
          dataType="clients"
        />

        <FileUploadCard
          title="Workers Data"
          description="WorkerID, Name, Skills, Slots, etc."
          dataType="workers"
        />

        <FileUploadCard
          title="Tasks Data"
          description="TaskID, Name, Duration, Skills, etc."
          dataType="tasks"
        />
      </div>
    </div>
  );
}
