const mean = (values: number[]) => {
  return values.reduce((p, c) => p + c, 0) / values.length;
};

export { mean };
