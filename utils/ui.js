export const reactIf = (condition, jsx1, jsx2 = "") => {
  if (condition) {
    return jsx1;
  }
  return jsx2;
};
