'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, MessageSquare, Lightbulb } from 'lucide-react';
import { RulesBuilder } from './RulesBuilder';
import { NaturalLanguageRules } from './NaturalLanguageRules';
import { RuleRecommendations } from './RuleRecommendations';

export function RulesPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Business Rules Engine</span>
          </CardTitle>
          <CardDescription>
            Create powerful business rules to control resource allocation behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="builder" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="builder" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Rules Builder</span>
              </TabsTrigger>
              <TabsTrigger value="natural" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Natural Language</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4" />
                <span>AI Recommendations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="builder" className="mt-6">
              <RulesBuilder />
            </TabsContent>
            
            <TabsContent value="natural" className="mt-6">
              <NaturalLanguageRules />
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-6">
              <RuleRecommendations />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}