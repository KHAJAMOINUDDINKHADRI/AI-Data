'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: number[];
  MaxConcurrent: number;
}

interface DataContextType {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  setClients: (clients: Client[]) => void;
  setWorkers: (workers: Worker[]) => void;
  setTasks: (tasks: Task[]) => void;
  updateClient: (index: number, client: Client) => void;
  updateWorker: (index: number, worker: Worker) => void;
  updateTask: (index: number, task: Task) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const updateClient = (index: number, client: Client) => {
    const newClients = [...clients];
    newClients[index] = client;
    setClients(newClients);
  };

  const updateWorker = (index: number, worker: Worker) => {
    const newWorkers = [...workers];
    newWorkers[index] = worker;
    setWorkers(newWorkers);
  };

  const updateTask = (index: number, task: Task) => {
    const newTasks = [...tasks];
    newTasks[index] = task;
    setTasks(newTasks);
  };

  return (
    <DataContext.Provider value={{
      clients, workers, tasks,
      setClients, setWorkers, setTasks,
      updateClient, updateWorker, updateTask,
      searchResults, setSearchResults
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}