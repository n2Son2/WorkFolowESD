
export interface TableField {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  description: string;
}

export interface TableSuggestion {
  tableName: string;
  fields: TableField[];
  reasoning: string;
}

export interface WorkflowStep {
  title: string;
  description: string;
  type: 'process' | 'decision' | 'start' | 'end';
}

export interface AnalysisResult {
  workflowSummary: string;
  steps: WorkflowStep[];
  databaseSchema: TableSuggestion[];
  optimizationTips: string[];
}
