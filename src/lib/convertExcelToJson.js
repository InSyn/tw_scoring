import XLSX from "read-excel-file/node";
import { writeFile } from "fs";

export const convertExcelToJson = async (path) => {
  const obj = [];

  await XLSX(path).then((rows) => {
    rows.forEach((row) => {
      const mgCode = {
        code: row[0].toString(),
        value_women: row[1].toFixed(2),
        value_men: row[2].toFixed(2),
      };
      obj.push(mgCode);
    });
  });

  writeFile(`${path}_converted.json`, JSON.stringify(obj), (err) => {
    if (err) throw new Error(err.message);

    console.log(JSON.stringify(obj));
  });
};
