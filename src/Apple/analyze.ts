import fs from "fs";
import { between } from "../utils/between";
import { days_to_ms } from "../utils/days_to_ms";
import { mean } from "../utils/stdevs";
import { HMapEntry } from "./transformer";

type Filter<T> = (value: T, index: number, array: T[]) => boolean;

//  TODO: Get average maintenance per week
const analyze = (input: string, filters: Filter<HMapEntry>[]) => {
  //  Read data
  const file = fs.readFileSync(input);
  const data: HMapEntry[] = JSON.parse(file.toString("utf-8"));

  //  Filter data

  const filtered_data = filter_all_data(
    data.map((d) => ({ ...d, date: new Date(d.date) })),
    filters
  );

  //  Compute maintenance
  const maintenance_calories = filtered_data.map(
    (e) => e.activeEnergyBurned + e.basalEnergyBurned
  );

  const mean_on_maintenance = mean(maintenance_calories);

  console.log(`Maintenance mean: ${Math.ceil(mean_on_maintenance)}`);
};

const filter_all_data = <T>(data: T[], filters: Filter<T>[]) => {
  return data.filter((v, i, a) =>
    filters.map((f) => f(v, i, a)).every((v) => v)
  );
};

const filter_by_last_x_days = (days: number) => {
  const NOW = Date.now();
  const LAST_DAY = new Date(NOW - days_to_ms(days));
  return (value: HMapEntry) => value.date > LAST_DAY;
};

const filter_between_days = (start: string, end: string) => {
  return (value: HMapEntry) =>
    between(value.date, new Date(start), new Date(end));
};

analyze("./data/transformed/apple.json", [
  filter_by_last_x_days(180),
  filter_between_days("2022-04-15", "2022-08-15"),
]);
