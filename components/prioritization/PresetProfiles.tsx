'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Zap, Scale, CheckCircle } from 'lucide-react';
import { useRules } from '@/lib/contexts/RulesContext';
import { toast } from 'sonner';

export function PresetProfiles() {
  const { preset, setPreset, setWeights } = useRules();

  const presets = [
    {
      id: 'maximize-fulfillment',
      name: 'Maximize Fulfillment',
      description: 'Focus on completing as many requested tasks as possible',
      icon: Target,
      color: 'bg-blue-500',
      weights: {
        priorityLevel: 15,
        taskFulfillment: 35,
        fairness: 10,
        workloadBalance: 15,
        skillMatching: 20,
        phasePreference: 5
      }
    },
    {
      id: 'fair-distribution',
      name: 'Fair Distribution',
      description: 'Ensure equal treatment and balanced allocation across all clients',
      icon: Scale,
      color: 'bg-green-500',
      weights: {
        priorityLevel: 10,
        taskFulfillment: 20,
        fairness: 35,
        workloadBalance: 20,
        skillMatching: 10,
        phasePreference: 5
      }
    },
    {
      id: 'minimize-workload',
      name: 'Minimize Workload',
      description: 'Optimize for worker satisfaction and prevent overloading',
      icon: Users,
      color: 'bg-purple-500',
      weights: {
        priorityLevel: 20,
        taskFulfillment: 15,
        fairness: 15,
        workloadBalance: 35,
        skillMatching: 10,
        phasePreference: 5
      }
    },
    {
      id: 'priority-first',
      name: 'Priority First',
      description: 'Heavily favor high-priority clients and urgent tasks',
      icon: Zap,
      color: 'bg-red-500',
      weights: {
        priorityLevel: 40,
        taskFulfillment: 25,
        fairness: 5,
        workloadBalance: 10,
        skillMatching: 15,
        phasePreference: 5
      }
    },
    {
      id: 'balanced',
      name: 'Balanced Approach',
      description: 'Well-rounded allocation considering all factors equally',
      icon: Scale,
      color: 'bg-gray-500',
      weights: {
        priorityLevel: 20,
        taskFulfillment: 20,
        fairness: 15,
        workloadBalance: 15,
        skillMatching: 20,
        phasePreference: 10
      }
    }
  ];

  const applyPreset = (presetData: typeof presets[0]) => {
    setPreset(presetData.id);
    setWeights(presetData.weights);
    toast.success(`Applied "${presetData.name}" preset`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((presetData) => (
          <Card 
            key={presetData.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              preset === presetData.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${presetData.color}`}>
                    <presetData.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">{presetData.name}</h3>
                    {preset === presetData.id && (
                      <Badge variant="default" className="mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{presetData.description}</p>
              
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-medium text-gray-700">Weight Distribution:</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>Priority: {presetData.weights.priorityLevel}%</div>
                  <div>Fulfillment: {presetData.weights.taskFulfillment}%</div>
                  <div>Fairness: {presetData.weights.fairness}%</div>
                  <div>Balance: {presetData.weights.workloadBalance}%</div>
                  <div>Skills: {presetData.weights.skillMatching}%</div>
                  <div>Phases: {presetData.weights.phasePreference}%</div>
                </div>
              </div>

              <Button 
                onClick={() => applyPreset(presetData)}
                variant={preset === presetData.id ? 'default' : 'outline'}
                className="w-full"
                disabled={preset === presetData.id}
              >
                {preset === presetData.id ? 'Currently Active' : 'Apply Preset'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Preset Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Preset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              💡 <strong>Pro Tip:</strong> You can create your own custom presets by adjusting weights 
              in the Weight Sliders tab and saving the configuration.
            </p>
            <p className="text-xs text-blue-700">
              Custom presets will be available in future versions of the Data Alchemist.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}