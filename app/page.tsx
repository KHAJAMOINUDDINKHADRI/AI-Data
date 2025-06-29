"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataIngestionPanel } from "@/components/data-ingestion/DataIngestionPanel";
import { ValidationPanel } from "@/components/validation/ValidationPanel";
import { RulesPanel } from "@/components/rules/RulesPanel";
import { PrioritizationPanel } from "@/components/prioritization/PrioritizationPanel";
import { ExportPanel } from "@/components/export/ExportPanel";
import { Header } from "@/components/layout/Header";
import { DataProvider } from "@/lib/contexts/DataContext";
import { ValidationProvider } from "@/lib/contexts/ValidationContext";
import { RulesProvider } from "@/lib/contexts/RulesContext";

export default function Home() {
  const [activeTab, setActiveTab] = useState("ingestion");

  return (
    <DataProvider>
      <ValidationProvider>
        <RulesProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  🚀 Data Alchemist
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Transform your messy spreadsheets into intelligent resource
                  allocation with AI-powered validation, rule generation, and
                  optimization controls
                </p>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5 mb-8">
                  <TabsTrigger value="ingestion" className="text-sm">
                    📊 Data Ingestion
                  </TabsTrigger>
                  <TabsTrigger value="validation" className="text-sm">
                    ✅ Validation
                  </TabsTrigger>
                  <TabsTrigger value="rules" className="text-sm">
                    ⚙️ Rules Builder
                  </TabsTrigger>
                  <TabsTrigger value="prioritization" className="text-sm">
                    📈 Prioritization
                  </TabsTrigger>
                  <TabsTrigger value="export" className="text-sm">
                    📤 Export
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ingestion" className="space-y-6">
                  <DataIngestionPanel />
                </TabsContent>

                <TabsContent value="validation" className="space-y-6">
                  <ValidationPanel />
                </TabsContent>

                <TabsContent value="rules" className="space-y-6">
                  <RulesPanel />
                </TabsContent>

                <TabsContent value="prioritization" className="space-y-6">
                  <PrioritizationPanel />
                </TabsContent>

                <TabsContent value="export" className="space-y-6">
                  <ExportPanel />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </RulesProvider>
      </ValidationProvider>
    </DataProvider>
  );
}
