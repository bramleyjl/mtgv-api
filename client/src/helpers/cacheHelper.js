export const getCachedData = (field, data = '') => {
  if (data !== '') {
    sessionStorage.setItem(field, data);
  } else {
    data = sessionStorage.getItem(field);
  }
  return data;
};

export const setCachedData = (field, data) => {
  sessionStorage.setItem(field, data);
};