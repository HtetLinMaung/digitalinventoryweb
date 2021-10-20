import commaNumber from "comma-number";

export const formatMoney = (money = "0") => {
  const m = parseFloat(
    money
      .toString()
      .replaceAll(",", "")
      .replace(/[a-zA-Z]/g, "") || "0"
  );
  return commaNumber(m.toFixed(2));
};
