"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "./FileUpload";
import { DataGrid } from "./DataGrid";
import { NaturalLanguageSearch } from "./NaturalLanguageSearch";
import { useData } from "@/lib/contexts/DataContext";
import { Database, Search, Upload } from "lucide-react";

export function DataIngestionPanel() {
  const { clients, workers, tasks } = useData();
  const [activeDataType, setActiveDataType] = useState<
    "clients" | "workers" | "tasks"
  >("clients");
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Ingestion & Management</span>
          </CardTitle>
          <CardDescription>
            Upload your CSV or XLSX files and manage your data with intelligent
            parsing and AI-powered features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="upload"
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>File Upload</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Data Grid</span>
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>AI Search</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <FileUpload />
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              <div className="space-y-4">
                <Tabs
                  value={activeDataType}
                  onValueChange={(value) => setActiveDataType(value as any)}
                >
                  <TabsList>
                    <TabsTrigger value="clients">
                      Clients ({clients.length})
                    </TabsTrigger>
                    <TabsTrigger value="workers">
                      Workers ({workers.length})
                    </TabsTrigger>
                    <TabsTrigger value="tasks">
                      Tasks ({tasks.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="clients" className="mt-4">
                    <DataGrid data={clients} type="clients" />
                  </TabsContent>

                  <TabsContent value="workers" className="mt-4">
                    <DataGrid data={workers} type="workers" />
                  </TabsContent>

                  <TabsContent value="tasks" className="mt-4">
                    <DataGrid data={tasks} type="tasks" />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <NaturalLanguageSearch />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
