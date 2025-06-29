'use client';

import { Sparkles, Database, Shield, Settings, Download } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Data Alchemist</h1>
              <p className="text-sm text-gray-500">AI Resource Allocation Configurator</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Smart Parsing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>AI Validation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Rule Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}