const between = (v: Date, start: Date, end: Date) => {
  return start <= v && v <= end;
};

export { between };
