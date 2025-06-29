'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Save } from 'lucide-react';
import { useRules } from '@/lib/contexts/RulesContext';
import { toast } from 'sonner';

interface CriterionItem {
  id: string;
  label: string;
  description: string;
  color: string;
}

export function DragDropRanking() {
  const { setWeights } = useRules();
  
  const [criteria, setCriteria] = useState<CriterionItem[]>([
    {
      id: 'priorityLevel',
      label: 'Priority Level',
      description: 'Client priority levels (1-5)',
      color: 'bg-red-500'
    },
    {
      id: 'taskFulfillment',
      label: 'Task Fulfillment',
      description: 'Completing requested tasks',
      color: 'bg-blue-500'
    },
    {
      id: 'skillMatching',
      label: 'Skill Matching',
      description: 'Worker skills match requirements',
      color: 'bg-purple-500'
    },
    {
      id: 'fairness',
      label: 'Fairness',
      description: 'Equal distribution across clients',
      color: 'bg-green-500'
    },
    {
      id: 'workloadBalance',
      label: 'Workload Balance',
      description: 'Even work distribution',
      color: 'bg-yellow-500'
    },
    {
      id: 'phasePreference',
      label: 'Phase Preference',
      description: 'Respecting preferred phases',
      color: 'bg-indigo-500'
    }
  ]);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = criteria.findIndex(item => item.id === draggedItem);
    const targetIndex = criteria.findIndex(item => item.id === targetId);

    const newCriteria = [...criteria];
    const [draggedCriterion] = newCriteria.splice(draggedIndex, 1);
    newCriteria.splice(targetIndex, 0, draggedCriterion);

    setCriteria(newCriteria);
    setDraggedItem(null);
  };

  const applyRanking = () => {
    // Convert ranking to weights (higher rank = higher weight)
    const totalItems = criteria.length;
    const weights = criteria.reduce((acc, item, index) => {
      const rank = totalItems - index; // Higher position = higher rank
      const weight = Math.round((rank / totalItems) * 100);
      acc[item.id as keyof typeof acc] = weight;
      return acc;
    }, {} as any);

    // Normalize to 100%
    const total = Object.values(weights).reduce((sum: number, weight: number) => sum + weight, 0);
    Object.keys(weights).forEach(key => {
      weights[key] = Math.round((weights[key] / total) * 100);
    });

    setWeights(weights);
    toast.success('Ranking applied to weights');
  };

  const getRankWeight = (index: number) => {
    const totalItems = criteria.length;
    const rank = totalItems - index;
    return Math.round((rank / totalItems) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Drag & Drop Priority Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Drag criteria to reorder them by importance. The top item will have the highest weight.
            </p>

            <div className="space-y-2">
              {criteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, criterion.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, criterion.id)}
                  className={`flex items-center space-x-3 p-4 bg-white border rounded-lg cursor-move hover:shadow-md transition-all ${
                    draggedItem === criterion.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  
                  <div className="flex items-center space-x-3 flex-1">
                    <Badge variant="outline" className="min-w-8 text-center">
                      #{index + 1}
                    </Badge>
                    
                    <div className={`w-4 h-4 rounded-full ${criterion.color}`} />
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{criterion.label}</h4>
                      <p className="text-sm text-gray-600">{criterion.description}</p>
                    </div>
                    
                    <Badge variant="secondary">
                      ~{getRankWeight(index)}% weight
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={applyRanking} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Apply Ranking to Weights
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {criteria.map((criterion, index) => (
              <div key={criterion.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span>{criterion.label}</span>
                </div>
                <span className="text-gray-500">~{getRankWeight(index)}% weight</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}