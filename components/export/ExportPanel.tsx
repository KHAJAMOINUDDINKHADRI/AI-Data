"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  FileSpreadsheet,
  Settings,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useData } from "@/lib/contexts/DataContext";
import { useRules } from "@/lib/contexts/RulesContext";
import { useValidation } from "@/lib/contexts/ValidationContext";
import { toast } from "sonner";

export function ExportPanel() {
  const { clients, workers, tasks } = useData();
  const { rules, weights } = useRules();
  const { errors } = useValidation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFormats, setSelectedFormats] = useState({
    csv: true,
    xlsx: false,
    rules: true,
  });

  const errorCount = errors.filter((e) => e.type === "error").length;
  const warningCount = errors.filter((e) => e.type === "warning").length;
  const totalRecords = clients.length + workers.length + tasks.length;
  const hasRules = rules.length > 0;

  const canExport = totalRecords > 0 && errorCount === 0;

  const handleExport = async () => {
    if (!canExport) {
      toast.error("Cannot export with validation errors");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const progressSteps = [
        { step: 20, message: "Preparing data..." },
        { step: 40, message: "Generating files..." },
        { step: 60, message: "Creating archives..." },
        { step: 80, message: "Finalizing export..." },
        { step: 100, message: "Export complete!" },
      ];

      for (const { step, message } of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setExportProgress(step);
      }

      // Dynamically import exportUtils only when needed
      const { exportToCSV, exportToXLSX, generateRulesJSON } = await import(
        "@/lib/utils/exportUtils"
      );

      // Generate exports based on selected formats
      if (selectedFormats.csv) {
        exportToCSV({ clients, workers, tasks });
      }

      if (selectedFormats.xlsx) {
        exportToXLSX({ clients, workers, tasks });
      }

      if (selectedFormats.rules) {
        const rulesConfig = generateRulesJSON(rules, weights);
        const blob = new Blob([JSON.stringify(rulesConfig, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "rules-config.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success("Export completed successfully!");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const getStatusColor = () => {
    if (errorCount > 0) return "text-red-600 bg-red-50 border-red-200";
    if (warningCount > 0)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (totalRecords === 0) return "text-gray-600 bg-gray-50 border-gray-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getStatusIcon = () => {
    if (errorCount > 0) return <AlertTriangle className="h-5 w-5" />;
    if (warningCount > 0) return <AlertTriangle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const getStatusMessage = () => {
    if (errorCount > 0)
      return `${errorCount} errors must be fixed before export`;
    if (warningCount > 0) return `${warningCount} warnings (export allowed)`;
    if (totalRecords === 0) return "No data to export";
    return "Ready for export";
  };

  return (
    <div className="space-y-6">
      {/* Export Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Status</span>
          </CardTitle>
          <CardDescription>
            Review your data and configuration before exporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <h4 className="font-medium">{getStatusMessage()}</h4>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span>📊 {totalRecords} total records</span>
                  <span>⚙️ {rules.length} business rules</span>
                  <span>❌ {errorCount} errors</span>
                  <span>⚠️ {warningCount} warnings</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Select Export Formats</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="csv"
                  checked={selectedFormats.csv}
                  onCheckedChange={(checked) =>
                    setSelectedFormats((prev) => ({ ...prev, csv: !!checked }))
                  }
                />
                <label
                  htmlFor="csv"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>CSV Files (clients.csv, workers.csv, tasks.csv)</span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="xlsx"
                  checked={selectedFormats.xlsx}
                  onCheckedChange={(checked) =>
                    setSelectedFormats((prev) => ({ ...prev, xlsx: !!checked }))
                  }
                />
                <label
                  htmlFor="xlsx"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel Workbook (data-alchemist.xlsx)</span>
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="rules"
                  checked={selectedFormats.rules}
                  onCheckedChange={(checked) =>
                    setSelectedFormats((prev) => ({
                      ...prev,
                      rules: !!checked,
                    }))
                  }
                />
                <label
                  htmlFor="rules"
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  <span>Rules Configuration (rules-config.json)</span>
                </label>
              </div>
            </div>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-gray-600">
                Exporting... {exportProgress}%
              </p>
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={
              !canExport ||
              isExporting ||
              !Object.values(selectedFormats).some(Boolean)
            }
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data & Configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Clients:</span>
                <Badge variant="outline">{clients.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Workers:</span>
                <Badge variant="outline">{workers.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Tasks:</span>
                <Badge variant="outline">{tasks.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rules Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Rules:</span>
                <Badge variant="outline">{rules.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Rules:</span>
                <Badge variant="outline">
                  {rules.filter((r) => r.enabled).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Weight Config:</span>
                <Badge variant={hasRules ? "default" : "secondary"}>
                  {hasRules ? "Ready" : "Default"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Errors:</span>
                <Badge variant={errorCount > 0 ? "destructive" : "outline"}>
                  {errorCount}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Warnings:</span>
                <Badge variant={warningCount > 0 ? "secondary" : "outline"}>
                  {warningCount}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={canExport ? "default" : "destructive"}>
                  {canExport ? "Ready" : "Issues"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
