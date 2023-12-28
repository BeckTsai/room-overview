import axios, { AxiosError } from 'axios';
import { parseQuery } from './utils';

const domainList = ['Goldenvistahotel', 'checkinnexpressntts', 'partner'];

const domain = domainList.includes(parseQuery('domain')) ? parseQuery('domain') : '';

const defaultAxiosConfigs = {
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: import.meta.env.VITE_PMS_DEV_TOKEN,
  },
  params: { domain: domain },
};

const success = (res: any) => res.data;

const logError = (err: typeof AxiosError) => {
  console.log(err);
  if (err.response.data.error === '找不到指定的飯店') {
    alert('請輸入正確網址');
  }
  return Promise.reject(err);
};
const $pms = axios.create(defaultAxiosConfigs);

$pms.interceptors.response.use(success, logError);

export default $pms;
