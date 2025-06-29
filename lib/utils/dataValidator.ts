import { Client, Worker, Task } from "@/lib/contexts/DataContext";

// Add this type above COLUMN_MAPPINGS

type ColumnMapping = { [key: string]: string };

// Enhanced AI-powered column mapping
const COLUMN_MAPPINGS = {
  clients: {
    id: "ClientID",
    client_id: "ClientID",
    clientid: "ClientID",
    client: "ClientID",
    name: "ClientName",
    client_name: "ClientName",
    clientname: "ClientName",
    priority: "PriorityLevel",
    priority_level: "PriorityLevel",
    prioritylevel: "PriorityLevel",
    level: "PriorityLevel",
    tasks: "RequestedTaskIDs",
    requested_tasks: "RequestedTaskIDs",
    task_ids: "RequestedTaskIDs",
    taskids: "RequestedTaskIDs",
    requestedtaskids: "RequestedTaskIDs",
    group: "GroupTag",
    group_tag: "GroupTag",
    grouptag: "GroupTag",
    tag: "GroupTag",
    attributes: "AttributesJSON",
    metadata: "AttributesJSON",
    extra: "AttributesJSON",
    json: "AttributesJSON",
  } as ColumnMapping,
  workers: {
    id: "WorkerID",
    worker_id: "WorkerID",
    workerid: "WorkerID",
    worker: "WorkerID",
    employee_id: "WorkerID",
    name: "WorkerName",
    worker_name: "WorkerName",
    workername: "WorkerName",
    employee_name: "WorkerName",
    skills: "Skills",
    skill_set: "Skills",
    skillset: "Skills",
    capabilities: "Skills",
    slots: "AvailableSlots",
    available_slots: "AvailableSlots",
    availableslots: "AvailableSlots",
    phases: "AvailableSlots",
    availability: "AvailableSlots",
    max_load: "MaxLoadPerPhase",
    maxload: "MaxLoadPerPhase",
    load: "MaxLoadPerPhase",
    capacity: "MaxLoadPerPhase",
    group: "WorkerGroup",
    worker_group: "WorkerGroup",
    workergroup: "WorkerGroup",
    team: "WorkerGroup",
    qualification: "QualificationLevel",
    qual_level: "QualificationLevel",
    level: "QualificationLevel",
    experience: "QualificationLevel",
  } as ColumnMapping,
  tasks: {
    id: "TaskID",
    task_id: "TaskID",
    taskid: "TaskID",
    task: "TaskID",
    name: "TaskName",
    task_name: "TaskName",
    taskname: "TaskName",
    title: "TaskName",
    category: "Category",
    type: "Category",
    kind: "Category",
    duration: "Duration",
    length: "Duration",
    time: "Duration",
    skills: "RequiredSkills",
    required_skills: "RequiredSkills",
    requiredskills: "RequiredSkills",
    needs: "RequiredSkills",
    requirements: "RequiredSkills",
    preferred: "PreferredPhases",
    preferred_phases: "PreferredPhases",
    preferredphases: "PreferredPhases",
    phases: "PreferredPhases",
    timing: "PreferredPhases",
    concurrent: "MaxConcurrent",
    max_concurrent: "MaxConcurrent",
    maxconcurrent: "MaxConcurrent",
    parallel: "MaxConcurrent",
  } as ColumnMapping,
};

export async function validateAndMapData(
  data: any[],
  type: "clients" | "workers" | "tasks"
): Promise<any[]> {
  if (!data || data.length === 0) return [];

  const sampleRow = data[0];
  const headers = Object.keys(sampleRow);

  // Try AI-powered column mapping first
  let columnMap: Record<string, string> = {};

  // Remove AI mapping, only use fallback mapping
  // Fallback to rule-based mapping for unmapped columns
  const mappings = COLUMN_MAPPINGS[type];
  Object.keys(sampleRow).forEach((existingCol) => {
    if (!columnMap[existingCol]) {
      const normalizedCol = existingCol.toLowerCase().replace(/[^a-z0-9]/g, "");
      const mappedCol =
        mappings[normalizedCol] || mappings[existingCol.toLowerCase()];
      if (mappedCol) {
        columnMap[existingCol] = mappedCol;
      }
    }
  });

  // Transform data using the mapping
  return data.map((row, index) => {
    const transformedRow: any = {};

    // Map known columns
    Object.entries(columnMap).forEach(([originalCol, mappedCol]) => {
      let value = row[originalCol];

      // Debug log for RequestedTaskIDs
      // if (mappedCol === "RequestedTaskIDs") {
      //   console.log("Raw RequestedTaskIDs value:", value);
      // }

      // Transform values based on expected format
      if (
        mappedCol.includes("IDs") ||
        mappedCol.includes("Skills") ||
        mappedCol.includes("Slots") ||
        mappedCol.includes("Phases")
      ) {
        // Handle arrays
        if (typeof value === "string") {
          value = value
            .split(/[,;|]/)
            .map((v: string) => {
              const trimmed = v.trim();
              // Try to parse as number for slots/phases
              if (mappedCol.includes("Slots") || mappedCol.includes("Phases")) {
                const num = parseInt(trimmed);
                return isNaN(num) ? trimmed : num;
              }
              return trimmed;
            })
            .filter((v: any) => v !== "");
        } else if (!Array.isArray(value)) {
          value = [];
        }
        // Debug log after splitting
        // if (mappedCol === "RequestedTaskIDs") {
        //   console.log("Parsed RequestedTaskIDs array:", value);
        // }
      } else if (
        mappedCol.includes("Level") ||
        mappedCol.includes("Duration") ||
        mappedCol.includes("Load") ||
        mappedCol.includes("Concurrent")
      ) {
        // Handle numbers
        value = parseInt(String(value)) || 0;
      } else if (mappedCol === "AttributesJSON") {
        // Handle JSON
        if (typeof value === "string") {
          try {
            value = JSON.parse(value);
          } catch {
            value = value; // Keep as string if not valid JSON
          }
        }
      }

      transformedRow[mappedCol] = value;
    });

    // Add default values for missing required fields
    switch (type) {
      case "clients":
        return {
          ClientID:
            transformedRow.ClientID || `C${String(index + 1).padStart(3, "0")}`,
          ClientName: transformedRow.ClientName || `Client ${index + 1}`,
          PriorityLevel: Math.max(
            1,
            Math.min(5, transformedRow.PriorityLevel || 1)
          ),
          RequestedTaskIDs: transformedRow.RequestedTaskIDs || [],
          GroupTag: transformedRow.GroupTag || "default",
          AttributesJSON: transformedRow.AttributesJSON || "{}",
        };

      case "workers":
        return {
          WorkerID:
            transformedRow.WorkerID || `W${String(index + 1).padStart(3, "0")}`,
          WorkerName: transformedRow.WorkerName || `Worker ${index + 1}`,
          Skills: transformedRow.Skills || [],
          AvailableSlots: transformedRow.AvailableSlots || [1, 2, 3],
          MaxLoadPerPhase: Math.max(1, transformedRow.MaxLoadPerPhase || 1),
          WorkerGroup: transformedRow.WorkerGroup || "default",
          QualificationLevel: Math.max(
            1,
            Math.min(10, transformedRow.QualificationLevel || 1)
          ),
        };

      case "tasks":
        return {
          TaskID:
            transformedRow.TaskID || `T${String(index + 1).padStart(3, "0")}`,
          TaskName: transformedRow.TaskName || `Task ${index + 1}`,
          Category: transformedRow.Category || "general",
          Duration: Math.max(1, transformedRow.Duration || 1),
          RequiredSkills: transformedRow.RequiredSkills || [],
          PreferredPhases: transformedRow.PreferredPhases || [1, 2, 3],
          MaxConcurrent: Math.max(1, transformedRow.MaxConcurrent || 1),
        };

      default:
        return transformedRow;
    }
  });
}
