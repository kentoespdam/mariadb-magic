export interface RulePreview {
  table: string;
  column?: string;
  type: "whitelist" | "blacklist" | "transform" | "filter" | "validation";
  config: Record<string, unknown>;
  sample?: Record<string, unknown>[];
}
