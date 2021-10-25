import axios from "axios";
import config from "../appconfig.json";

const getDefaultHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem("iamtoken")}`,
  };
};

export default {
  post: async (suburl, body, headers = {}) => {
    try {
      const data = await axios.post(config.iam + suburl, body, {
        headers: { ...getDefaultHeaders(), ...headers },
      });
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  },
  get: async (suburl, headers = {}) => {
    try {
      const data = await axios.get(config.iam + suburl, {
        headers: { ...getDefaultHeaders(), ...headers },
      });
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  },
  put: async (suburl, body, headers = {}) => {
    try {
      const data = await axios.put(config.iam + suburl, body, {
        headers: { ...getDefaultHeaders(), ...headers },
      });
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  },
  delete: async (suburl, headers = {}) => {
    try {
      const data = await axios.delete(config.iam + suburl, {
        headers: { ...getDefaultHeaders(), ...headers },
      });
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  },
};
