import XLSX from 'read-excel-file/node';
import { writeFile } from 'fs';
import { roundNumber } from './utils';

export const convertExcelToJson = async (path) => {
  const obj = [];

  await XLSX(path).then((rows) => {
    rows.forEach((row) => {
      const mgCode = {
        code: row[0].toString(),
        value_women: roundNumber(row[1], 2),
        value_men: roundNumber(row[2], 2),
      };
      obj.push(mgCode);
    });
  });

  writeFile(`${path}_converted.json`, JSON.stringify(obj), (err) => {
    if (err) throw new Error(err.message);

    console.log(JSON.stringify(obj));
  });
};
