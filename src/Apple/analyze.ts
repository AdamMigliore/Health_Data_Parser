import fs from "fs";
import { between } from "../utils/between";
import { days_to_ms } from "../utils/days_to_ms";
import { mean, stdev_p } from "../utils/stdevs";
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
  const stdev = stdev_p(maintenance_calories);
  const mean_ = mean(maintenance_calories);

  const maintenance_calories_filtered = maintenance_calories.filter(
    (e) => e > mean_ - stdev && e < mean_ + stdev
  );
  const mean_on_maintenance = mean(maintenance_calories_filtered);

  console.log(`Maintenance mean: ${Math.ceil(mean_on_maintenance)}`);
};

const filter_all_data = <T>(data: T[], filters: Filter<T>[]) => {
  return data.filter((v, i, a) =>
    filters.map((f) => f(v, i, a)).reduce((p, c) => p && c, true)
  );
};

const filter_by_last_x_days: Filter<HMapEntry> = (value: HMapEntry) => {
  const LAST_X_DAYS = 180;
  const NOW = Date.now();
  const LAST_DAY = new Date(NOW - days_to_ms(LAST_X_DAYS));
  return value.date < LAST_DAY;
};

const filter_between_days: Filter<HMapEntry> = (value: HMapEntry) => {
  const start = new Date("2022-04-24");
  const end = new Date("2022-05-21");
  return between(value.date, start, end);
};

analyze("./data/transformed/apple.json", [filter_between_days]);
