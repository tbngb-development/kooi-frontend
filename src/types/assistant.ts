export interface AssistantConfig {
  voice?: { provider: string; voiceId: string };
  [key: string]: unknown;
}

export interface Assistant {
  id: string;
  bolnaId: string;
  name: string;
  tenantId: string;
  config: AssistantConfig;
  createdAt: string;
}

export interface AssistantDetail {
  assistant: Assistant;
  variables: string[];
}


export interface RegisterAssistantInput {
  name: string;
  bolnaId: string;
}

export interface UpdateAssistantInput {
  name?: string;
}

export type CreateAssistantInput = RegisterAssistantInput;

export interface BolnaAgent {
  id: string;
  agent_name: string;
  agent_type: string;
  created_at: string;
}