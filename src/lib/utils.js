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

export function cutMarks(arr, higherCount, lowerCount) {
  for (let high = 0; high < +higherCount; high++) {
    arr.splice(arr.indexOf(Math.max(...arr)), 1);
  }
  for (let low = 0; low < +lowerCount; low++) {
    arr.splice(arr.indexOf(Math.min(...arr)), 1);
  }
  return arr;
}
