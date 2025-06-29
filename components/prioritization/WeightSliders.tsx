'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save } from 'lucide-react';
import { useRules } from '@/lib/contexts/RulesContext';
import { toast } from 'sonner';

export function WeightSliders() {
  const { weights, setWeights } = useRules();

  const criteria = [
    {
      key: 'priorityLevel' as keyof typeof weights,
      label: 'Priority Level',
      description: 'How much client priority levels matter',
      color: 'bg-red-500'
    },
    {
      key: 'taskFulfillment' as keyof typeof weights,
      label: 'Task Fulfillment',
      description: 'Importance of completing requested tasks',
      color: 'bg-blue-500'
    },
    {
      key: 'fairness' as keyof typeof weights,
      label: 'Fairness',
      description: 'Equal distribution across clients',
      color: 'bg-green-500'
    },
    {
      key: 'workloadBalance' as keyof typeof weights,
      label: 'Workload Balance',
      description: 'Even distribution of work among workers',
      color: 'bg-yellow-500'
    },
    {
      key: 'skillMatching' as keyof typeof weights,
      label: 'Skill Matching',
      description: 'How well worker skills match task requirements',
      color: 'bg-purple-500'
    },
    {
      key: 'phasePreference' as keyof typeof weights,
      label: 'Phase Preference',
      description: 'Respecting preferred execution phases',
      color: 'bg-indigo-500'
    }
  ];

  const updateWeight = (key: keyof typeof weights, value: number) => {
    setWeights({ ...weights, [key]: value });
  };

  const resetToDefaults = () => {
    setWeights({
      priorityLevel: 25,
      taskFulfillment: 20,
      fairness: 15,
      workloadBalance: 15,
      skillMatching: 15,
      phasePreference: 10
    });
    toast.success('Weights reset to defaults');
  };

  const saveWeights = () => {
    toast.success('Prioritization weights saved');
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weight Configuration</span>
            <div className="flex items-center space-x-2">
              <Badge variant={totalWeight === 100 ? 'default' : 'destructive'}>
                Total: {totalWeight}%
              </Badge>
              <Button size="sm" variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {criteria.map((criterion) => (
            <div key={criterion.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">{criterion.label}</Label>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${criterion.color}`}
                    style={{ opacity: weights[criterion.key] / 50 }}
                  />
                  <Badge variant="outline" className="min-w-16 text-center">
                    {weights[criterion.key]}%
                  </Badge>
                </div>
              </div>
              
              <Slider
                value={[weights[criterion.key]]}
                onValueChange={([value]) => updateWeight(criterion.key, value)}
                max={50}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          ))}

          {totalWeight !== 100 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Weights should total 100% for optimal allocation. 
                Current total: <strong>{totalWeight}%</strong>
              </p>
            </div>
          )}

          <Button onClick={saveWeights} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Weight Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Visual Weight Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Distribution Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex h-8 rounded-lg overflow-hidden">
              {criteria.map((criterion) => (
                <div
                  key={criterion.key}
                  className={criterion.color}
                  style={{ width: `${(weights[criterion.key] / totalWeight) * 100}%` }}
                  title={`${criterion.label}: ${weights[criterion.key]}%`}
                />
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {criteria.map((criterion) => (
                <div key={criterion.key} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${criterion.color}`} />
                  <span>{criterion.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}