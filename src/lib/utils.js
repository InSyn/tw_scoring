import fs from "fs";

export function generateId() {
  let array = new Uint32Array(2);
  crypto.getRandomValues(array);
  let id = array[0].toString(36) + array[1].toString(36);
  if (id.length > 8) {
    id = id.slice(0, 8);
  }
  return id;
}

export function getAECodes() {
  fs.readFile(
    `${process.cwd()}/app_assets/AE_CODES.json`,
    "utf8",
    (err, data) => {
      if (err) console.error(err);
      localStorage.setItem("AE_CODES", data);
    }
  );

  return JSON.parse(localStorage.getItem("AE_CODES"));
}

export function getMGCodes() {
  fs.readFile(
    `${process.cwd()}/app_assets/MG_CODES.json`,
    "utf8",
    (err, data) => {
      if (err) console.error(err);
      localStorage.setItem("MG_CODES", data);
    }
  );

  return JSON.parse(localStorage.getItem("MG_CODES"));
}

export function cutMarks(arr, higherCount, lowerCount) {
  for (let high = 0; high < parseInt(higherCount); high++) {
    arr.splice(arr.indexOf(Math.max(...arr)), 1);
  }
  for (let low = 0; low < parseInt(lowerCount); low++) {
    arr.splice(arr.indexOf(Math.min(...arr)), 1);
  }

  return arr;
}

export function convertCyrillicToLatin(cyrillicString) {
  const cyrillicToLatinMap = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "y",
    ы: "y",
    ь: "'",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  const latinString = cyrillicString
    .toString()
    .trim()
    .split("")
    .map((char) => {
      const isUpperCase = char === char.toUpperCase();
      const lowerChar = char.toLowerCase();

      if (lowerChar === " ") {
        return " ";
      }

      const latinChar = cyrillicToLatinMap[lowerChar] || char;

      return isUpperCase ? latinChar[0].toUpperCase() : latinChar;
    })
    .join("");

  return latinString;
}

export const roundNumber = (n, d) => Number(Math.round(n + "e" + d) + "e-" + d);
