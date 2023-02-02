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
  if (!localStorage.getItem("AE_CODES"))
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
