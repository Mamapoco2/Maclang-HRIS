const LS_KEY = "orient_module_v1";

export const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
};

export const saveState = (s) => localStorage.setItem(LS_KEY, JSON.stringify(s));
