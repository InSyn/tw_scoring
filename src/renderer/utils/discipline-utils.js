import { isQualification } from '../data/sports';

const pairingOrders = {
  2: [[0, 1]],
  4: [
    [0, 3],
    [2, 1],
  ],
  8: [
    [0, 7],
    [4, 3],
    [2, 5],
    [6, 1],
  ],
  16: [
    [0, 15],
    [8, 7],
    [4, 11],
    [12, 3],
    [2, 13],
    [10, 5],
    [6, 9],
    [14, 1],
  ],
  32: [
    [0, 31],
    [16, 15],
    [8, 23],
    [24, 7],
    [4, 27],
    [20, 11],
    [12, 19],
    [28, 3],
    [2, 29],
    [18, 13],
    [10, 21],
    [26, 5],
    [6, 25],
    [22, 9],
    [14, 17],
    [30, 1],
  ],
  64: [
    [0, 63],
    [32, 31],
    [16, 47],
    [48, 15],
    [8, 55],
    [40, 23],
    [24, 39],
    [56, 7],
    [4, 59],
    [36, 27],
    [20, 43],
    [52, 11],
    [12, 51],
    [44, 19],
    [28, 35],
    [60, 3],
    [2, 61],
    [34, 29],
    [18, 45],
    [50, 13],
    [10, 53],
    [42, 21],
    [26, 37],
    [58, 5],
    [6, 57],
    [38, 25],
    [22, 41],
    [54, 9],
    [14, 49],
    [46, 17],
    [30, 33],
    [62, 1],
  ],
  128: [
    [0, 127],
    [64, 63],
    [32, 95],
    [96, 31],
    [16, 111],
    [80, 47],
    [48, 79],
    [112, 15],
    [8, 119],
    [72, 55],
    [40, 87],
    [104, 23],
    [24, 103],
    [88, 39],
    [56, 71],
    [120, 7],
    [4, 123],
    [68, 59],
    [36, 91],
    [100, 27],
    [20, 107],
    [84, 43],
    [52, 75],
    [116, 11],
    [12, 115],
    [76, 51],
    [44, 83],
    [108, 19],
    [28, 99],
    [92, 35],
    [60, 67],
    [124, 3],
    [2, 125],
    [66, 61],
    [34, 93],
    [98, 29],
    [18, 109],
    [82, 45],
    [50, 77],
    [114, 13],
    [10, 117],
    [74, 53],
    [42, 85],
    [106, 21],
    [26, 101],
    [90, 37],
    [58, 69],
    [122, 5],
    [6, 121],
    [70, 57],
    [38, 89],
    [102, 25],
    [22, 105],
    [86, 41],
    [54, 73],
    [118, 9],
    [14, 113],
    [78, 49],
    [46, 81],
    [110, 17],
    [30, 97],
    [94, 33],
    [62, 1],
  ],
};
export function fillDualMogulsBrackets(startList, size) {
  const pairingOrder = pairingOrders[size];
  if (!pairingOrder) {
    throw new Error(`No bracket table for size ${size}.`);
  }
  return pairingOrder.map(([i1, i2]) => [startList[i1], startList[i2]]);
}

export const getScoresQuantity = (competition, discipline) => {
  switch (discipline) {
    case 'AE':
    case 'AET':
      return 3;
    case 'DMO':
      return isQualification(competition) ? 2 : 1;
    case 'MO':
      return 2;
    default:
      return 1;
  }
};
