export const buildQuery = (obj = {}) => {
  return Object.entries(obj)
    .filter(([k, v]) => v != null)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
};
