export const chronosAppRoutes = {
  today: '/today',
  planning: '/planning',
  review: '/review',
  insights: '/insights',
} as const;

export const chronosAppSectionPaths = [
  chronosAppRoutes.today,
  chronosAppRoutes.planning,
  chronosAppRoutes.review,
  chronosAppRoutes.insights,
] as const;

export const chronosAppActionPaths = [
  chronosAppRoutes.today,
  chronosAppRoutes.planning,
  chronosAppRoutes.review,
] as const;

export type ChronosAppSectionPath = (typeof chronosAppSectionPaths)[number];
export type ChronosAppActionPath = (typeof chronosAppActionPaths)[number];
