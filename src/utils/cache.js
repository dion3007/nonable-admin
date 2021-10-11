export const customerDataSet = (c) => {
  localStorage.setItem('customer', JSON.stringify(c));
};

export const customerDataGet = () => {
  const getData = localStorage.getItem('customer');
  return JSON.parse(getData);
};

export const userDataSet = (u) => {
  localStorage.setItem('user', JSON.stringify(u));
};

export const userDataGet = () => {
  const getData = localStorage.getItem('user');
  return JSON.parse(getData);
};

export const driverDataSet = (u) => {
  localStorage.setItem('driver', JSON.stringify(u));
};

export const driverDataGet = () => {
  const getData = localStorage.getItem('driver');
  return JSON.parse(getData);
};

export const clientDataSet = (u) => {
  localStorage.setItem('client', JSON.stringify(u));
};

export const clientDataGet = () => {
  const getData = localStorage.getItem('client');
  return JSON.parse(getData);
};

export const jobDataSet = (u) => {
  localStorage.setItem('job', JSON.stringify(u));
};

export const jobDataGet = () => {
  const getData = localStorage.getItem('job');
  return JSON.parse(getData);
};

export const authDataSet = (u) => {
  localStorage.setItem('auth', JSON.stringify(u));
};

export const authLogout = () => {
  localStorage.removeItem('auth');
};

export const authDataGet = () => {
  const getData = localStorage.getItem('auth');
  return JSON.parse(getData);
};

export const variableDataSet = (u) => {
  localStorage.setItem('variable', JSON.stringify(u));
};

export const variableDataGet = () => {
  const getData = localStorage.getItem('variable');
  return JSON.parse(getData);
};
