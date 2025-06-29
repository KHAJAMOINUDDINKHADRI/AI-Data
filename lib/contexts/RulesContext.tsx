"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Rule {
  id: string;
  type:
    | "coRun"
    | "slotRestriction"
    | "loadLimit"
    | "phaseWindow"
    | "patternMatch"
    | "precedence"
    | "custom";
  name: string;
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
  priority: number;
}

export interface PrioritizationWeights {
  priorityLevel: number;
  taskFulfillment: number;
  fairness: number;
  workloadBalance: number;
  skillMatching: number;
  phasePreference: number;
}

interface RulesContextType {
  rules: Rule[];
  setRules: (rules: Rule[]) => void;
  addRule: (rule: Rule) => void;
  updateRule: (id: string, rule: Partial<Rule>) => void;
  removeRule: (id: string) => void;
  weights: PrioritizationWeights;
  setWeights: (weights: PrioritizationWeights) => void;
  preset: string;
  setPreset: (preset: string) => void;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [preset, setPreset] = useState("balanced");
  const [weights, setWeights] = useState<PrioritizationWeights>({
    priorityLevel: 25,
    taskFulfillment: 20,
    fairness: 15,
    workloadBalance: 15,
    skillMatching: 15,
    phasePreference: 10,
  });

  const addRule = (rule: Rule) => {
    // console.log("Adding rule to context:", rule);
    setRules((prev) => {
      const newRules = [...prev, rule];
      // console.log("Updated rules array:", newRules);
      return newRules;
    });
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id));
  };

  return (
    <RulesContext.Provider
      value={{
        rules,
        setRules,
        addRule,
        updateRule,
        removeRule,
        weights,
        setWeights,
        preset,
        setPreset,
      }}
    >
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error("useRules must be used within a RulesProvider");
  }
  return context;
}
