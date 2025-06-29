"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Save, Settings } from "lucide-react";
import { useRules, Rule } from "@/lib/contexts/RulesContext";
import { useData } from "@/lib/contexts/DataContext";
import { toast } from "sonner";

export function RulesBuilder() {
  const { rules, addRule, updateRule, removeRule } = useRules();
  const { clients, workers, tasks } = useData();

  // Debug logging
  // console.log("RulesBuilder - Current rules:", rules);
  // console.log("RulesBuilder - Rules count:", rules.length);

  // Monitor rules changes
  // useEffect(() => {
  //   console.log("RulesBuilder - Rules changed:", rules);
  // }, [rules]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: "coRun",
    name: "",
    description: "",
    parameters: {},
    enabled: true,
    priority: 1,
  });

  const ruleTypes = [
    {
      value: "coRun",
      label: "Co-run Tasks",
      description: "Tasks that must run together",
    },
    {
      value: "slotRestriction",
      label: "Slot Restriction",
      description: "Limit common slots for groups",
    },
    {
      value: "loadLimit",
      label: "Load Limit",
      description: "Maximum slots per phase for workers",
    },
    {
      value: "phaseWindow",
      label: "Phase Window",
      description: "Restrict tasks to specific phases",
    },
    {
      value: "patternMatch",
      label: "Pattern Match",
      description: "Regex-based rule matching",
    },
    {
      value: "precedence",
      label: "Precedence Override",
      description: "Priority-based rule ordering",
    },
  ];

  const handleAddRule = () => {
    if (!newRule.name || !newRule.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const rule: Rule = {
      id: `rule-${Date.now()}`,
      type: newRule.type as Rule["type"],
      name: newRule.name,
      description: newRule.description,
      parameters: newRule.parameters || {},
      enabled: newRule.enabled ?? true,
      priority: newRule.priority ?? 1,
    };

    addRule(rule);
    setNewRule({
      type: "coRun",
      name: "",
      description: "",
      parameters: {},
      enabled: true,
      priority: 1,
    });
    setShowAddForm(false);
    toast.success("Rule added successfully");
  };

  const renderRuleParameters = (rule: Partial<Rule>) => {
    switch (rule.type) {
      case "coRun":
        return (
          <div className="space-y-2">
            <Label>Tasks to Co-run</Label>
            <Select
              value={rule.parameters?.tasks?.join(",") || ""}
              onValueChange={(value) =>
                setNewRule((prev) => ({
                  ...prev,
                  parameters: {
                    ...prev.parameters,
                    tasks: value.split(",").filter((t) => t),
                  },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tasks" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.TaskID} value={task.TaskID}>
                    {task.TaskName} ({task.TaskID})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "loadLimit":
        return (
          <div className="space-y-2">
            <div>
              <Label>Worker Group</Label>
              <Input
                value={rule.parameters?.workerGroup || ""}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      workerGroup: e.target.value,
                    },
                  }))
                }
                placeholder="Enter worker group"
              />
            </div>
            <div>
              <Label>Max Slots Per Phase</Label>
              <Input
                type="number"
                value={rule.parameters?.maxSlots || ""}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      maxSlots: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="Enter max slots"
              />
            </div>
          </div>
        );

      case "phaseWindow":
        return (
          <div className="space-y-2">
            <div>
              <Label>Task ID</Label>
              <Select
                value={rule.parameters?.taskId || ""}
                onValueChange={(value) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: { ...prev.parameters, taskId: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.TaskID} value={task.TaskID}>
                      {task.TaskName} ({task.TaskID})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Allowed Phases (comma-separated)</Label>
              <Input
                value={rule.parameters?.phases?.join(",") || ""}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      phases: e.target.value
                        .split(",")
                        .map((p) => parseInt(p.trim()))
                        .filter((p) => !isNaN(p)),
                    },
                  }))
                }
                placeholder="1,2,3"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No specific parameters for this rule type
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Active Rules ({rules.length})</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const testRule = {
                  id: `test-rule-${Date.now()}`,
                  type: "coRun" as const,
                  name: "Test Rule",
                  description: "This is a test rule",
                  parameters: { tasks: ["T001", "T002"] },
                  enabled: true,
                  priority: 5,
                };
                // console.log("Adding test rule:", testRule);
                addRule(testRule);
              }}
            >
              Add Test Rule
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>

        {rules.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Settings className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No rules created yet</h3>
                <p className="text-sm">
                  Add your first business rule to get started
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{rule.type}</Badge>
                          <Badge
                            variant={rule.enabled ? "default" : "secondary"}
                          >
                            {rule.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Priority: {rule.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) =>
                          updateRule(rule.id, { enabled })
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRule(rule.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeRule(rule.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    {rule.description}
                  </p>
                  {Object.keys(rule.parameters).length > 0 && (
                    <div className="text-xs text-gray-500">
                      <strong>Parameters:</strong>{" "}
                      {JSON.stringify(rule.parameters)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add New Rule Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rule Type</Label>
              <Select
                value={newRule.type}
                onValueChange={(value) =>
                  setNewRule((prev) => ({
                    ...prev,
                    type: value as Rule["type"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ruleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rule Name</Label>
              <Input
                value={newRule.name}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter rule name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={newRule.description}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this rule does"
              />
            </div>

            <div>
              <Label>Priority (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newRule.priority}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    priority: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>

            {renderRuleParameters(newRule)}

            <div className="flex items-center space-x-2">
              <Switch
                checked={newRule.enabled}
                onCheckedChange={(enabled) =>
                  setNewRule((prev) => ({ ...prev, enabled }))
                }
              />
              <Label>Enable this rule</Label>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAddRule}>
                <Save className="h-4 w-4 mr-2" />
                Save Rule
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
