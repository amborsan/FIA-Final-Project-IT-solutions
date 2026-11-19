import type { TranslationKey } from "../i18n/translations";

const specificScopes = new Map<string, readonly [TranslationKey, TranslationKey]>([
  ["network-solutions", ["services.scope.network-solutions.1", "services.scope.network-solutions.2"]],
  ["cctv-surveillance", ["services.scope.cctv-surveillance.1", "services.scope.cctv-surveillance.2"]],
  ["it-support", ["services.scope.it-support.1", "services.scope.it-support.2"]],
  ["web-development", ["services.scope.web-development.1", "services.scope.web-development.2"]],
  ["cybersecurity", ["services.scope.cybersecurity.1", "services.scope.cybersecurity.2"]],
  ["server-cloud", ["services.scope.server-cloud.1", "services.scope.server-cloud.2"]],
  ["access-control", ["services.scope.access-control.1", "services.scope.access-control.2"]],
  ["voip-communication", ["services.scope.voip-communication.1", "services.scope.voip-communication.2"]],
  ["it-infrastructure", ["services.scope.it-infrastructure.1", "services.scope.it-infrastructure.2"]],
  ["it-consulting", ["services.scope.it-consulting.1", "services.scope.it-consulting.2"]],
]);

const projectExamples = new Map<string, TranslationKey>([
  ["network-solutions", "services.example.network-solutions"],
  ["cctv-surveillance", "services.example.cctv-surveillance"],
  ["it-support", "services.example.it-support"],
  ["web-development", "services.example.web-development"],
  ["cybersecurity", "services.example.cybersecurity"],
  ["server-cloud", "services.example.server-cloud"],
  ["access-control", "services.example.access-control"],
  ["voip-communication", "services.example.voip-communication"],
  ["it-infrastructure", "services.example.it-infrastructure"],
  ["it-consulting", "services.example.it-consulting"],
]);

export function getServiceScopeKeys(slug: string): TranslationKey[] {
  const delivery = specificScopes.get(slug) ?? (["services.scope3", "services.scope4"] as const);
  return ["services.scope1", "services.scope2", ...delivery];
}

export function getServiceExampleKey(slug: string): TranslationKey | undefined {
  return projectExamples.get(slug);
}
