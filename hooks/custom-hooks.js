import { useState } from "react";

export const useData = (initState = {}) => {
  const [state, setStateData] = useState(initState);

  return [
    state,
    (obj = {}) => {
      setStateData({ ...state, ...obj });
    },
  ];
};
