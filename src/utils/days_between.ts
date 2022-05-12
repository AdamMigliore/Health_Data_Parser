import { days_to_ms } from "./days_to_ms";

const days_between = (d1: Date, d2: Date) => {
  return Math.ceil(Math.abs(d1.getTime() - d2.getTime()) / days_to_ms(1));
};

export { days_between };
