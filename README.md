# Data Alchemist - AI Resource Allocation Configurator

A comprehensive Next.js web application that transforms messy spreadsheets into intelligent resource allocation configurations using AI-powered features.

## Features

### 🚀 Core Functionality

- **Smart Data Ingestion**: Upload CSV/XLSX files with intelligent column mapping
- **Real-time Validation**: 12+ validation rules with immediate feedback
- **Interactive Data Grids**: Inline editing with live validation
- **Business Rules Engine**: Visual and natural language rule creation
- **Advanced Prioritization**: Multiple weighting approaches (sliders, presets, drag-drop, pairwise)
- **Export System**: Clean data + rules configuration for downstream systems

### 🤖 AI-Powered Features

- **DeepSeek Integration**: Advanced AI model via OpenRouter
- **Natural Language Search**: Query data using plain English
- **Intelligent Rule Creation**: Convert natural language to business rules
- **AI Rule Recommendations**: Pattern-based rule suggestions
- **Smart Column Mapping**: Automatic header mapping for various formats
- **Validation Insights**: AI-powered data quality analysis

### 📊 Data Entities

- **Clients**: Priority levels, requested tasks, group tags
- **Workers**: Skills, availability, load limits, qualifications
- **Tasks**: Requirements, duration, phases, concurrency limits

## Setup

1. **Clone and Install**

   ```bash
   git clone <repository>
   cd data-alchemist
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local` file in the root directory:

   ```env
   # Required for AI functionality - Get from https://openrouter.ai/
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # Optional: Customize AI model (default is free tier)
   AI_MODEL=deepseek/deepseek-chat-v3-0324:free

   # Optional: Site URL for OpenRouter
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Get OpenRouter API Key**

   - Visit [OpenRouter.ai](https://openrouter.ai)
   - Create account and generate API key
   - Add credits for DeepSeek model usage (free tier available)

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Troubleshooting

### AI Search Not Working

If you see "Search failed" errors:

1. **Check Environment Variables**: Ensure `.env.local` file exists with `OPENROUTER_API_KEY`
2. **API Key Valid**: Verify your OpenRouter API key is valid and has credits
3. **Network Issues**: Check if you can access https://openrouter.ai
4. **Fallback Mode**: The app will use basic search if AI is unavailable

### Common Issues

- **404 Errors**: Make sure you're running `npm run dev` (not static export)
- **API Key Errors**: Check OpenRouter dashboard for key validity
- **Rate Limits**: Free tier has usage limits, consider upgrading

## AI Integration

The application uses DeepSeek AI through OpenRouter for:

- **Natural Language Processing**: Convert user queries to structured filters
- **Rule Parsing**: Transform plain English rules into executable configurations
- **Pattern Recognition**: Analyze data for optimization opportunities
- **Intelligent Mapping**: Automatically map CSV columns to standard fields
- **Validation Insights**: Generate actionable data quality recommendations

## Usage Workflow

1. **Data Ingestion**: Upload CSV/XLSX files for clients, workers, and tasks
2. **Validation**: Review and fix any data quality issues
3. **Rule Creation**: Build business rules using visual tools or natural language
4. **Prioritization**: Configure weights and priorities for allocation logic
5. **Export**: Download cleaned data and rules configuration

## Technology Stack

- **Frontend**: Next.js 13, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: DeepSeek via OpenRouter API
- **Data Processing**: Papa Parse (CSV), SheetJS (XLSX)
- **State Management**: React Context API
- **Validation**: Custom validation engine with 12+ rules

## Validation Rules

1. Missing required columns
2. Duplicate IDs
3. Malformed lists/arrays
4. Out-of-range values
5. Broken JSON
6. Unknown references
7. Circular dependencies
8. Conflicting rules
9. Overloaded workers
10. Phase slot saturation
11. Skill coverage gaps
12. Concurrency feasibility

## Business Rules

- **Co-run**: Tasks that must execute together
- **Load Limit**: Maximum slots per phase for worker groups
- **Phase Window**: Restrict tasks to specific phases
- **Slot Restriction**: Limit common slots for groups
- **Precedence**: Priority-based rule ordering
- **Pattern Match**: Regex-based rule matching

## Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details
