export const serviceGroups = [
  { id: "connected-teams", titleKey: "home.topicNetworks", heroDescriptionKey: "home.topicNetworksText", descriptionKey: "services.groupNetworksText", icon: "network" },
  { id: "secure-systems", titleKey: "home.topicSecurity", heroDescriptionKey: "home.topicSecurityText", descriptionKey: "services.groupSecurityText", icon: "shield" },
  { id: "business-online", titleKey: "home.topicWebsites", heroDescriptionKey: "home.topicWebsitesText", descriptionKey: "services.groupWebsitesText", icon: "code" },
] as const;

type ServiceGroupId = (typeof serviceGroups)[number]["id"];

const groupBySlug: Record<string, ServiceGroupId> = {
  "network-solutions": "connected-teams",
  "it-support": "connected-teams",
  "server-cloud": "connected-teams",
  "voip-communication": "connected-teams",
  "it-infrastructure": "connected-teams",
  "it-consulting": "connected-teams",
  "cctv-surveillance": "secure-systems",
  cybersecurity: "secure-systems",
  "access-control": "secure-systems",
  "web-development": "business-online",
};

export function getServiceGroupId(slug: string): ServiceGroupId {
  // New general IT services stay discoverable until their group is assigned.
  return groupBySlug[slug] ?? "connected-teams";
}
