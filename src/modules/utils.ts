import dayjs from 'dayjs';
import { isNil } from 'lodash';

export const getNowTime = (format = 'YYYY-MM-DD'): string => {
  return dayjs().format(format);
};

/** 將字串轉換為 regex 可用內容
 * 自動將特殊符號加上跳脫符號（\）
 * @param {String} str
 */

export const str2RegexStr = (str: string) => {
  if (isNil(str)) {
    return '';
  }

  const regex = `${str}`.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  return regex;
};

export const blobToBase64 = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      resolve(e.target.result);
    };
    // readAsDataURL
    fileReader.readAsDataURL(blob);
    fileReader.onerror = () => {
      reject(new Error('blobToBase64 error'));
    };
  });
};

export const base64ToBlob = (dataUrl: string) => {
  const bytes_string = atob(dataUrl.substring(dataUrl.indexOf(',') + 1));
  const mime_type = dataUrl.substring(0, dataUrl.indexOf(',')).split(':')[1].split(';')[0];
  const content = [];
  for (let i = 0; i < bytes_string.length; i++) {
    content[i] = bytes_string.charCodeAt(i);
  }
  return new Blob([new Uint8Array(content)], { type: mime_type });
};

export const objectToFormData = (target: any) => {
  const formData = new FormData();
  Object.keys(target).forEach((key: string) => {
    const value = target[key];
    formData.append(key, value);
  });
  return formData;
};

export const parseQuery = (key: string) => {
  const queryString = window.location.search;
  if (URLSearchParams) {
    const qs = new URLSearchParams(queryString);
    return qs.get(key);
  }

  const query = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    // @ts-ignore
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  // @ts-ignore
  return query[key];
};
