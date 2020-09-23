export const getCachedData = (field, data) => {
  var values = data;
  if (values !== "") {
    localStorage.setItem(field, values);
  } else {
    values = localStorage.getItem(field);
  }
  return values;
};
