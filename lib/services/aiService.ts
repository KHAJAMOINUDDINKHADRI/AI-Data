import OpenAI from "openai";

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

class AIService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    this.openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Data Alchemist",
      },
    });
    this.model = process.env.AI_MODEL || "deepseek/deepseek-chat-v3-0324:free";
  }

  async makeRequest(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages,
      });
      return {
        success: true,
        data: completion.choices[0]?.message?.content || "",
      };
    } catch (error: any) {
      console.error("AI Service Error:", error);
      return {
        success: false,
        error: error?.message || "Unknown AI service error",
      };
    }
  }

  async processNaturalLanguageQuery(
    query: string,
    context: any
  ): Promise<AIResponse> {
    const systemPrompt = `You are an expert data analyst for a resource allocation system. 
    You help users search and filter data using natural language queries.
    
    Available data entities:
    - Clients: ClientID, ClientName, PriorityLevel (1-5), RequestedTaskIDs, GroupTag, AttributesJSON
    - Workers: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel
    - Tasks: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent
    
    Return a JSON object with:
    {
      "entityType": "clients|workers|tasks",
      "filters": [
        {
          "field": "fieldName",
          "operator": "equals|contains|greaterThan|lessThan|in",
          "value": "filterValue"
        }
      ],
      "explanation": "Brief explanation of the search"
    }`;

    const userPrompt = `Parse this natural language query and return appropriate filters:
    Query: "${query}"
    
    Context data sample:
    ${JSON.stringify(context, null, 2).substring(0, 1000)}...`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return this.makeRequest(messages);
  }

  async parseNaturalLanguageRule(
    ruleText: string,
    context: any
  ): Promise<AIResponse> {
    const systemPrompt = `You are an expert business rules analyst. Convert natural language business rules into structured rule objects.
    
    Supported rule types:
    - coRun: Tasks that must run together
    - loadLimit: Maximum slots per phase for worker groups
    - phaseWindow: Restrict tasks to specific phases
    - slotRestriction: Limit common slots for groups
    - precedence: Priority-based rule ordering
    - patternMatch: Regex-based matching
    
    Return a JSON object with:
    {
      "ruleType": "coRun|loadLimit|phaseWindow|slotRestriction|precedence|patternMatch",
      "name": "Human readable rule name",
      "description": "Detailed description",
      "parameters": {
        // Rule-specific parameters
      },
      "confidence": 0.0-1.0,
      "reasoning": "Why this interpretation was chosen"
    }`;

    const userPrompt = `Convert this natural language rule to a structured rule:
    Rule: "${ruleText}"
    
    Available data context:
    ${JSON.stringify(context, null, 2).substring(0, 1000)}...`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return this.makeRequest(messages);
  }

  async generateRuleRecommendations(data: any): Promise<AIResponse> {
    const systemPrompt = `You are an expert resource allocation consultant. Analyze data patterns and recommend business rules.
    
    Focus on:
    - Co-run opportunities (tasks often requested together)
    - Load balancing (worker group capacity management)
    - Phase optimization (avoiding bottlenecks)
    - Priority handling (high-priority client preferences)
    - Skill coverage (ensuring task requirements are met)
    
    Return a JSON array of recommendations:
    [
      {
        "id": "unique-id",
        "title": "Short title",
        "description": "What this rule does",
        "reasoning": "Why this rule is recommended",
        "ruleType": "coRun|loadLimit|phaseWindow|precedence",
        "parameters": {},
        "confidence": 0.0-1.0,
        "impact": "high|medium|low"
      }
    ]`;

    const userPrompt = `Analyze this data and recommend business rules:
    
    Data summary:
    - Clients: ${data.clients?.length || 0} records
    - Workers: ${data.workers?.length || 0} records  
    - Tasks: ${data.tasks?.length || 0} records
    
    Sample data:
    ${JSON.stringify(
      {
        clients: data.clients?.slice(0, 3) || [],
        workers: data.workers?.slice(0, 3) || [],
        tasks: data.tasks?.slice(0, 3) || [],
      },
      null,
      2
    )}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return this.makeRequest(messages);
  }

  async generateValidationSuggestions(
    data: any,
    errors: any[]
  ): Promise<AIResponse> {
    const systemPrompt = `You are a data quality expert. Analyze data and validation errors to provide actionable insights and suggestions.
    
    Focus on:
    - Data quality patterns
    - Potential improvements
    - Risk assessments
    - Optimization opportunities
    
    Return a JSON array of suggestions:
    [
      {
        "title": "Issue title",
        "description": "What the issue is",
        "action": "Recommended action",
        "severity": "high|medium|low",
        "category": "skill_gap|workload|phase_balance|data_quality"
      }
    ]`;

    const userPrompt = `Analyze this data and provide validation insights:
    
    Current errors: ${errors.length}
    Error types: ${errors.map((e) => e.category).join(", ")}
    
    Data overview:
    ${JSON.stringify(
      {
        clientCount: data.clients?.length || 0,
        workerCount: data.workers?.length || 0,
        taskCount: data.tasks?.length || 0,
        sampleErrors: errors.slice(0, 3),
      },
      null,
      2
    )}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return this.makeRequest(messages);
  }

  async suggestDataCorrections(data: any, errors: any[]): Promise<AIResponse> {
    const systemPrompt = `You are a data correction specialist. Analyze validation errors and suggest specific fixes.
    
    Provide actionable corrections for:
    - Missing required fields
    - Invalid data formats
    - Range violations
    - Reference errors
    - Inconsistencies
    
    Return a JSON array of corrections:
    [
      {
        "errorId": "error-id",
        "entity": "clients|workers|tasks",
        "rowIndex": 0,
        "field": "fieldName",
        "currentValue": "current value",
        "suggestedValue": "suggested value",
        "reasoning": "Why this correction is suggested",
        "confidence": 0.0-1.0
      }
    ]`;

    const userPrompt = `Suggest corrections for these validation errors:
    
    Errors to fix:
    ${JSON.stringify(errors.slice(0, 10), null, 2)}
    
    Related data context:
    ${JSON.stringify(data, null, 2).substring(0, 1500)}...`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return this.makeRequest(messages);
  }

  async intelligentColumnMapping(
    headers: string[],
    entityType: string
  ): Promise<AIResponse> {
    const systemPrompt = `You are a data mapping expert. Map CSV/Excel column headers to standard entity fields.
    
    Standard fields for ${entityType}:
    ${
      entityType === "clients"
        ? "ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON"
        : entityType === "workers"
        ? "WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel"
        : "TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent"
    }
    
    Return a JSON object mapping input headers to standard fields:
    {
      "mappings": {
        "input_header": "standard_field",
        ...
      },
      "confidence": 0.0-1.0,
      "unmapped": ["headers", "that", "couldnt", "be", "mapped"]
    }`;

    const userPrompt = `Map these column headers to standard ${entityType} fields:
    Headers: ${JSON.stringify(headers)}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    return this.makeRequest(messages);
  }
}

export const aiService = new AIService();
