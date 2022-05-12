const stdev_p = (data: number[]): number => {
  const avg = mean(data);

  const stdev = Math.sqrt(
    (1 / data.length) * data.reduce((prev, curr) => prev + (curr - avg) ** 2, 0)
  );

  return stdev;
};

const mean = (data: number[]): number => {
  return data.reduce((p, c) => p + c, 0) / data.length;
};

export { mean, stdev_p };
