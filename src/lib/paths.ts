export const paths = {
  home: () => '/',

  admin: () => '/admin',

  myGifts: () => '/my-gifts',

  item: (slug: string, id: string) => `/item/${slug}-p${id}`,
} as const;
