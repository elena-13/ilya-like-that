// App paths are locale-less ("/my-gifts"). Render them with Link / redirect
// from @/i18n/navigation, which add the /ua prefix for Ukrainian.
export const paths = {
  home: () => '/',

  // Payload admin: outside the locale routes, link with a plain <a>.
  admin: () => '/admin',

  myGifts: () => '/my-gifts',

  item: (slug: string, id: string) => `/item/${slug}-p${id}`,
} as const;
