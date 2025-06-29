
interface SearchContext {
  clients: any[];
  workers: any[];
  tasks: any[];
}

interface SearchResult {
  results: any[];
  type: string;
  explanation?: string;
}

// Only keep the fallback/basic query logic
export function processNaturalLanguageQuery(
  query: string,
  context: SearchContext
): SearchResult {
  // Fallback to basic pattern matching
  return processBasicQuery(query, context);
}

function applyFilter(data: any[], filter: any): any[] {
  const { field, operator, value } = filter;
  return data.filter((item) => {
    const fieldValue = item[field];
    switch (operator) {
      case "equals":
        return fieldValue === value;
      case "contains":
        return String(fieldValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      case "greaterThan":
        return Number(fieldValue) > Number(value);
      case "lessThan":
        return Number(fieldValue) < Number(value);
      case "in":
        return (
          Array.isArray(fieldValue) &&
          fieldValue.some((v) =>
            String(v).toLowerCase().includes(String(value).toLowerCase())
          )
        );
      case "arrayContains":
        return Array.isArray(fieldValue) && fieldValue.includes(value);
      default:
        return true;
    }
  });
}

function processBasicQuery(
  query: string,
  context: SearchContext
): SearchResult {
  const lowerQuery = query.toLowerCase();
  let entityType = "clients";
  if (lowerQuery.includes("worker") || lowerQuery.includes("employee")) {
    entityType = "workers";
  } else if (lowerQuery.includes("task") || lowerQuery.includes("job")) {
    entityType = "tasks";
  }
  let data = context[entityType as keyof SearchContext];
  let results = [...data];
  if (lowerQuery.includes("high priority")) {
    results = results.filter((item: any) => item.PriorityLevel >= 4);
  } else if (lowerQuery.includes("low priority")) {
    results = results.filter((item: any) => item.PriorityLevel <= 2);
  }
  if (
    lowerQuery.includes("programming") ||
    lowerQuery.includes("java") ||
    lowerQuery.includes("python")
  ) {
    results = results.filter(
      (item: any) =>
        item.Skills &&
        item.Skills.some(
          (skill: string) =>
            skill.toLowerCase().includes("java") ||
            skill.toLowerCase().includes("python") ||
            skill.toLowerCase().includes("programming")
        )
    );
  }
  if (lowerQuery.includes("available in phase")) {
    const phaseMatch = lowerQuery.match(/phase (\d+)/);
    if (phaseMatch) {
      const phase = parseInt(phaseMatch[1]);
      results = results.filter(
        (item: any) =>
          item.AvailableSlots && item.AvailableSlots.includes(phase)
      );
    }
  }
  if (lowerQuery.includes("duration") && lowerQuery.includes("more than")) {
    const durationMatch = lowerQuery.match(/more than (\d+)/);
    if (durationMatch) {
      const duration = parseInt(durationMatch[1]);
      results = results.filter((item: any) => item.Duration > duration);
    }
  }
  if (lowerQuery.includes("multiple skills")) {
    results = results.filter(
      (item: any) => item.RequiredSkills && item.RequiredSkills.length > 1
    );
  }
  const taskIdMatch = lowerQuery.match(/task ([a-zA-Z0-9]+)/i);
  if (taskIdMatch) {
    const taskId = taskIdMatch[1].toUpperCase();
    if (entityType === "clients") {
      results = results.filter(
        (item: any) =>
          item.RequestedTaskIDs && item.RequestedTaskIDs.includes(taskId)
      );
    }
  }
  return {
    results: results.slice(0, 50),
    type: entityType,
    explanation: "Basic pattern matching applied",
  };
}
