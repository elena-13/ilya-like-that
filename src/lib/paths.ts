export const paths = {
  home: () => '/',

  admin: () => '/admin',

  item: (slug: string, id: string) => `/item/${slug}-p${id}`,
} as const;
