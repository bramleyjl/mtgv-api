export const getCachedData = (field, data = '') => {
  if (data !== '') {
    localStorage.setItem(field, data);
  } else {
    data = localStorage.getItem(field);
  }
  return data;
};

export const setCachedData = (field, data) => {
  localStorage.setItem(field, data);
};
