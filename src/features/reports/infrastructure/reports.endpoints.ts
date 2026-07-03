export const reportEndpoints = {
  list: (slug: string) => `/reports/${slug}`,
  export: (slug: string) => `/reports/${slug}/export/excel`,
};
