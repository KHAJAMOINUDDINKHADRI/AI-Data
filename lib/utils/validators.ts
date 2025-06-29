import { ValidationError } from '@/lib/contexts/ValidationContext';
import { Client, Worker, Task } from '@/lib/contexts/DataContext';

interface DataContext {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
}

export function runAllValidations(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Run all validation functions
  errors.push(...validateRequiredColumns(context));
  errors.push(...validateDuplicateIDs(context));
  errors.push(...validateMalformedLists(context));
  errors.push(...validateRangeValues(context));
  errors.push(...validateBrokenJSON(context));
  errors.push(...validateUnknownReferences(context));
  errors.push(...validateCircularCoRuns(context));
  errors.push(...validateOverloadedWorkers(context));
  errors.push(...validatePhaseSlotSaturation(context));
  errors.push(...validateSkillCoverage(context));
  errors.push(...validateMaxConcurrencyFeasibility(context));
  errors.push(...validateConflictingRules(context));
  
  return errors;
}

function validateRequiredColumns(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check clients
  context.clients.forEach((client, index) => {
    if (!client.ClientID) {
      errors.push({
        id: `client-id-${index}`,
        type: 'error',
        category: 'Required Columns',
        message: 'ClientID is required',
        entity: 'clients',
        rowIndex: index,
        column: 'ClientID',
        suggestion: 'Generate a unique client ID'
      });
    }
    if (!client.ClientName) {
      errors.push({
        id: `client-name-${index}`,
        type: 'warning',
        category: 'Required Columns',
        message: 'ClientName is missing',
        entity: 'clients',
        rowIndex: index,
        column: 'ClientName',
        suggestion: 'Add a descriptive client name'
      });
    }
  });
  
  // Similar checks for workers and tasks...
  context.workers.forEach((worker, index) => {
    if (!worker.WorkerID) {
      errors.push({
        id: `worker-id-${index}`,
        type: 'error',
        category: 'Required Columns',
        message: 'WorkerID is required',
        entity: 'workers',
        rowIndex: index,
        column: 'WorkerID',
        suggestion: 'Generate a unique worker ID'
      });
    }
  });
  
  context.tasks.forEach((task, index) => {
    if (!task.TaskID) {
      errors.push({
        id: `task-id-${index}`,
        type: 'error',
        category: 'Required Columns',
        message: 'TaskID is required',
        entity: 'tasks',
        rowIndex: index,
        column: 'TaskID',
        suggestion: 'Generate a unique task ID'
      });
    }
  });
  
  return errors;
}

function validateDuplicateIDs(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Check duplicate client IDs
  const clientIds = context.clients.map(c => c.ClientID).filter(id => id);
  const duplicateClientIds = clientIds.filter((id, index) => clientIds.indexOf(id) !== index);
  
  duplicateClientIds.forEach(id => {
    const indices = context.clients
      .map((c, i) => ({ client: c, index: i }))
      .filter(({ client }) => client.ClientID === id)
      .map(({ index }) => index);
      
    indices.forEach(index => {
      errors.push({
        id: `duplicate-client-${id}-${index}`,
        type: 'error',
        category: 'Duplicate IDs',
        message: `Duplicate ClientID: ${id}`,
        entity: 'clients',
        rowIndex: index,
        column: 'ClientID',
        suggestion: 'Make client IDs unique'
      });
    });
  });
  
  // Similar logic for workers and tasks...
  const workerIds = context.workers.map(w => w.WorkerID).filter(id => id);
  const duplicateWorkerIds = workerIds.filter((id, index) => workerIds.indexOf(id) !== index);
  
  duplicateWorkerIds.forEach(id => {
    const indices = context.workers
      .map((w, i) => ({ worker: w, index: i }))
      .filter(({ worker }) => worker.WorkerID === id)
      .map(({ index }) => index);
      
    indices.forEach(index => {
      errors.push({
        id: `duplicate-worker-${id}-${index}`,
        type: 'error',
        category: 'Duplicate IDs',
        message: `Duplicate WorkerID: ${id}`,
        entity: 'workers',
        rowIndex: index,
        column: 'WorkerID',
        suggestion: 'Make worker IDs unique'
      });
    });
  });
  
  return errors;
}

function validateMalformedLists(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  context.workers.forEach((worker, index) => {
    if (worker.AvailableSlots && Array.isArray(worker.AvailableSlots)) {
      const hasInvalidSlots = worker.AvailableSlots.some(slot => 
        typeof slot !== 'number' || isNaN(slot) || slot < 1
      );
      
      if (hasInvalidSlots) {
        errors.push({
          id: `malformed-slots-${index}`,
          type: 'error',
          category: 'Malformed Lists',
          message: 'AvailableSlots contains invalid values',
          entity: 'workers',
          rowIndex: index,
          column: 'AvailableSlots',
          suggestion: 'Use only positive integers for phase slots'
        });
      }
    }
  });
  
  return errors;
}

function validateRangeValues(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  context.clients.forEach((client, index) => {
    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      errors.push({
        id: `priority-range-${index}`,
        type: 'error',
        category: 'Out of Range Values',
        message: 'PriorityLevel must be between 1 and 5',
        entity: 'clients',
        rowIndex: index,
        column: 'PriorityLevel',
        suggestion: 'Set priority to a value between 1-5'
      });
    }
  });
  
  context.tasks.forEach((task, index) => {
    if (task.Duration < 1) {
      errors.push({
        id: `duration-range-${index}`,
        type: 'error',
        category: 'Out of Range Values',
        message: 'Duration must be at least 1',
        entity: 'tasks',
        rowIndex: index,
        column: 'Duration',
        suggestion: 'Set duration to at least 1 phase'
      });
    }
  });
  
  return errors;
}

function validateBrokenJSON(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  context.clients.forEach((client, index) => {
    if (client.AttributesJSON && typeof client.AttributesJSON === 'string') {
      try {
        JSON.parse(client.AttributesJSON);
      } catch {
        errors.push({
          id: `broken-json-${index}`,
          type: 'error',
          category: 'Broken JSON',
          message: 'AttributesJSON is not valid JSON',
          entity: 'clients',
          rowIndex: index,
          column: 'AttributesJSON',
          suggestion: 'Fix JSON syntax or leave empty'
        });
      }
    }
  });
  
  return errors;
}

function validateUnknownReferences(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const taskIds = new Set(context.tasks.map(t => t.TaskID));
  
  context.clients.forEach((client, index) => {
    if (client.RequestedTaskIDs && Array.isArray(client.RequestedTaskIDs)) {
      client.RequestedTaskIDs.forEach(taskId => {
        if (!taskIds.has(taskId)) {
          errors.push({
            id: `unknown-task-${index}-${taskId}`,
            type: 'error',
            category: 'Unknown References',
            message: `Referenced TaskID '${taskId}' does not exist`,
            entity: 'clients',
            rowIndex: index,
            column: 'RequestedTaskIDs',
            suggestion: 'Remove invalid task reference or add the missing task'
          });
        }
      });
    }
  });
  
  return errors;
}

function validateCircularCoRuns(context: DataContext): ValidationError[] {
  // This would implement circular dependency detection for co-run rules
  // For now, return empty array as this requires rule data
  return [];
}

function validateOverloadedWorkers(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  context.workers.forEach((worker, index) => {
    const availableSlots = worker.AvailableSlots?.length || 0;
    const maxLoad = worker.MaxLoadPerPhase || 1;
    
    if (availableSlots < maxLoad) {
      errors.push({
        id: `overloaded-worker-${index}`,
        type: 'warning',
        category: 'Overloaded Workers',
        message: 'Worker has fewer available slots than max load per phase',
        entity: 'workers',
        rowIndex: index,
        column: 'MaxLoadPerPhase',
        suggestion: 'Increase available slots or reduce max load per phase'
      });
    }
  });
  
  return errors;
}

function validatePhaseSlotSaturation(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Calculate total slots per phase
  const phaseSlots: Record<number, number> = {};
  context.workers.forEach(worker => {
    (worker.AvailableSlots || []).forEach(phase => {
      phaseSlots[phase] = (phaseSlots[phase] || 0) + (worker.MaxLoadPerPhase || 1);
    });
  });
  
  // Calculate required slots per phase
  const requiredSlots: Record<number, number> = {};
  context.tasks.forEach(task => {
    (task.PreferredPhases || []).forEach(phase => {
      requiredSlots[phase] = (requiredSlots[phase] || 0) + task.Duration;
    });
  });
  
  // Check for saturation
  Object.keys(requiredSlots).forEach(phase => {
    const phaseNum = parseInt(phase);
    const required = requiredSlots[phaseNum];
    const available = phaseSlots[phaseNum] || 0;
    
    if (required > available) {
      errors.push({
        id: `phase-saturation-${phase}`,
        type: 'warning',
        category: 'Phase Slot Saturation',
        message: `Phase ${phase} requires ${required} slots but only ${available} are available`,
        entity: 'tasks',
        suggestion: 'Add more workers for this phase or adjust task preferences'
      });
    }
  });
  
  return errors;
}

function validateSkillCoverage(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const workerSkills = new Set(context.workers.flatMap(w => w.Skills || []));
  
  context.tasks.forEach((task, index) => {
    const requiredSkills = task.RequiredSkills || [];
    const uncoveredSkills = requiredSkills.filter(skill => !workerSkills.has(skill));
    
    if (uncoveredSkills.length > 0) {
      errors.push({
        id: `skill-coverage-${index}`,
        type: 'error',
        category: 'Skill Coverage',
        message: `Required skills not available: ${uncoveredSkills.join(', ')}`,
        entity: 'tasks',
        rowIndex: index,
        column: 'RequiredSkills',
        suggestion: 'Add workers with these skills or adjust task requirements'
      });
    }
  });
  
  return errors;
}

function validateMaxConcurrencyFeasibility(context: DataContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  context.tasks.forEach((task, index) => {
    const requiredSkills = task.RequiredSkills || [];
    const qualifiedWorkers = context.workers.filter(worker =>
      requiredSkills.every(skill => (worker.Skills || []).includes(skill))
    );
    
    if (task.MaxConcurrent > qualifiedWorkers.length) {
      errors.push({
        id: `max-concurrency-${index}`,
        type: 'warning',
        category: 'Max Concurrency Feasibility',
        message: `MaxConcurrent (${task.MaxConcurrent}) exceeds qualified workers (${qualifiedWorkers.length})`,
        entity: 'tasks',
        rowIndex: index,
        column: 'MaxConcurrent',
        suggestion: 'Reduce max concurrency or add more qualified workers'
      });
    }
  });
  
  return errors;
}

function validateConflictingRules(context: DataContext): ValidationError[] {
  // This would validate business rules for conflicts
  // For now, return empty array as this requires rule data
  return [];
}