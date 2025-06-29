'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  category: string;
  message: string;
  entity: 'clients' | 'workers' | 'tasks';
  rowIndex?: number;
  column?: string;
  suggestion?: string;
}

interface ValidationContextType {
  errors: ValidationError[];
  setErrors: (errors: ValidationError[]) => void;
  addError: (error: ValidationError) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  isValidating: boolean;
  setIsValidating: (validating: boolean) => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export function ValidationProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const addError = (error: ValidationError) => {
    setErrors(prev => [...prev, error]);
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ValidationContext.Provider value={{
      errors, setErrors, addError, removeError, clearErrors,
      isValidating, setIsValidating
    }}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
}