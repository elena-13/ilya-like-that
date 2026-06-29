export const paths = {
  home: () => '/',

  item: (slug: string, id: string) => `/item/${slug}-p${id}`,
} as const;
