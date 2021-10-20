export const buildQuery = (obj = {}) => {
  return Object.entries(obj)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
};
