export const rotateColor180 = (data, length) => {
  for (let i = 0; i < length / 2; i += 4) {
    const temp1 = data[i];
    const temp2 = data[i + 1];
    const temp3 = data[i + 2];
    const temp4 = data[i + 3];
    data[i] = data[length - i];
    data[i + 1] = data[length - i + 1];
    data[i + 2] = data[length - i + 2];
    data[i + 3] = data[length - i + 3];
    data[length - i] = temp1;
    data[length - i + 1] = temp2;
    data[length - i + 2] = temp3;
    data[length - i + 3] = temp4;
  }
};