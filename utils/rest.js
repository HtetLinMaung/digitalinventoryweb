import axios from "axios";
import config from "../appconfig.json";

const getDefaultHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
};

export default {
  post: async (suburl, body, headers = {}) => {
    try {
      const data = await axios.post(config.domain + suburl, body, {
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
      const data = await axios.get(config.domain + suburl, {
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
      const data = await axios.put(config.domain + suburl, body, {
        headers: { ...getDefaultHeaders(), ...headers },
      });
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  },
  delete: async (suburl, body = {}, headers = {}) => {
    try {
      const data = await axios.delete(config.domain + suburl, body, {
        headers: { ...getDefaultHeaders(), ...headers },
      });
      return [data, null];
    } catch (err) {
      console.error(err);
      return [null, err];
    }
  },
};
