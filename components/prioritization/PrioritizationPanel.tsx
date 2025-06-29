'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Sliders, ArrowUpDown, Target } from 'lucide-react';
import { WeightSliders } from './WeightSliders';
import { PresetProfiles } from './PresetProfiles';
import { PairwiseComparison } from './PairwiseComparison';
import { DragDropRanking } from './DragDropRanking';

export function PrioritizationPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Prioritization & Weights Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure how the resource allocation system should balance different criteria and priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sliders" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sliders" className="flex items-center space-x-2">
                <Sliders className="h-4 w-4" />
                <span>Weight Sliders</span>
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Preset Profiles</span>
              </TabsTrigger>
              <TabsTrigger value="ranking" className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4" />
                <span>Drag & Drop</span>
              </TabsTrigger>
              <TabsTrigger value="pairwise" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Pairwise</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sliders" className="mt-6">
              <WeightSliders />
            </TabsContent>
            
            <TabsContent value="presets" className="mt-6">
              <PresetProfiles />
            </TabsContent>
            
            <TabsContent value="ranking" className="mt-6">
              <DragDropRanking />
            </TabsContent>
            
            <TabsContent value="pairwise" className="mt-6">
              <PairwiseComparison />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}