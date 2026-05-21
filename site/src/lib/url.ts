const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}` || '/';
};
