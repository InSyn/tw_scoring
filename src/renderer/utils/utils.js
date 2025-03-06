import fs from 'fs';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

export function generateId() {
  let array = new Uint32Array(2);
  crypto.getRandomValues(array);
  let id = array[0].toString(36) + array[1].toString(36);
  if (id.length > 8) {
    id = id.slice(0, 8);
  }
  return id;
}
export const generateUUID = () => uuidv4();

export function getAECodes() {
  let codes = JSON.parse(fs.readFileSync(`${process.cwd()}/app_assets/AE_CODES.json`, 'utf8')) || [];

  return codes;
}

export function getMGCodes() {
  let codes = JSON.parse(fs.readFileSync(`${process.cwd()}/app_assets/MG_CODES.json`, 'utf8')) || [];

  return codes;
}

export function cutMarks(arr, higherCount, lowerCount) {
  for (let high = 0; high < Number(higherCount); high++) {
    arr.splice(arr.indexOf(Math.max(...arr)), 1);
  }
  for (let low = 0; low < Number(lowerCount); low++) {
    arr.splice(arr.indexOf(Math.min(...arr)), 1);
  }
  return arr;
}

export const formatTimeSpan = (milliseconds, digits = 4) => {
  let hours = Math.floor(milliseconds / (1000 * 60 * 60));
  let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  let ms = milliseconds % 1000;

  hours = ('0' + hours).slice(-2);
  minutes = ('0' + minutes).slice(-2);
  seconds = ('0' + seconds).slice(-2);
  ms = ms.toString().slice(0, digits);

  const timeString = `${hours > 0 ? hours + ':' : ''}${minutes > 0 ? minutes + ':' : ''}${seconds}.${ms}`;

  return timeString[0] === '0' ? timeString.slice(1, timeString.length) : timeString;
};

export function convertCyrillicToLatin(cyrillicString) {
  const cyrillicToLatinMap = new Map([
    ['а', 'a'],
    ['б', 'b'],
    ['в', 'v'],
    ['г', 'g'],
    ['д', 'd'],
    ['е', 'e'],
    ['ё', 'yo'],
    ['ж', 'zh'],
    ['з', 'z'],
    ['и', 'i'],
    ['й', 'y'],
    ['к', 'k'],
    ['л', 'l'],
    ['м', 'm'],
    ['н', 'n'],
    ['о', 'o'],
    ['п', 'p'],
    ['р', 'r'],
    ['с', 's'],
    ['т', 't'],
    ['у', 'u'],
    ['ф', 'f'],
    ['х', 'kh'],
    ['ц', 'ts'],
    ['ч', 'ch'],
    ['ш', 'sh'],
    ['щ', 'sch'],
    ['ъ', 'y'],
    ['ы', 'y'],
    ['ь', "'"],
    ['э', 'e'],
    ['ю', 'yu'],
    ['я', 'ya'],
  ]);

  if (!cyrillicString) return '';

  const latinString = cyrillicString
    .toString()
    .trim()
    .split('')
    .map((char) => {
      const isUpperCase = char === char.toUpperCase();
      const lowerChar = char.toLowerCase();

      if (lowerChar === ' ') {
        return ' ';
      }

      const latinChar = cyrillicToLatinMap.get(lowerChar) || char;

      return isUpperCase ? latinChar.toUpperCase() : latinChar;
    })
    .join('');

  return latinString;
}

export const roundNumber = (n, d) => new Decimal(n).toDecimalPlaces(d).toNumber();
export const truncateNumber = (n, d) => Math.trunc(n * Math.pow(10, d)) / Math.pow(10, d);

export function debounce(fn, wait = 25) {
  let timeout;
  let promise = null;
  let resolvePromise = null;

  return function (...args) {
    if (timeout) clearTimeout(timeout);
    if (!promise) {
      promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
    }
    timeout = setTimeout(async () => {
      const result = await fn.apply(this, args);
      resolvePromise(result);
      promise = null;
      timeout = null;
    }, wait);
    return promise;
  };
}

export const sanitizeStageName = (fileNameText) => {
  return fileNameText.replace(/\//g, '-').replace(/\\/g, '-');
};

export const getShallowCopy = (obj) => {
  const copiedObj = {};

  for (let objKey in obj) {
    if (typeof obj[objKey] === 'object') {
      copiedObj[objKey] = getShallowCopy(obj[objKey]);
    } else if (Array.isArray(obj[objKey])) {
      copiedObj[objKey] = obj[objKey].map((item) => (typeof item === 'object' ? getShallowCopy(item) : item));
    } else {
      copiedObj[objKey] = obj[objKey];
    }
  }

  return copiedObj;
};
