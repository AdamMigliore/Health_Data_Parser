import { plot as nodePlotLib, Plot } from "nodeplotlib";
import CaloricProfile from "../models/CaloricProfile";
import { days_between } from "../utils/days_between";
import { mean, stdev_p } from "../utils/stdevs";

const CALORIES_PER_POUND = 3500;
const MIN_CALORIC_DIFFERENCE = -200;
const MAX_DAYS_DIFFERENCE = 3;
const HEIGHT = 166;
const IS_MALE = true;
const AGE = 22;

type Caloric_filter = (arg0: CaloricProfile) => boolean;

const filter = (data: CaloricProfile[], filters: Caloric_filter[]) => {
  //    Filter on valid data
  let clone_dataset = [...data];
  for (const filter of filters) {
    clone_dataset = clone_dataset.filter(filter);
  }

  return clone_dataset;
};

const analysis = (data: CaloricProfile[]) => {
  const today = new Date();

  const maintenance_estimate: number[] = [];
  const maintenance_calculated: number[] = [];
  const maintenance_weight: number[] = [];
  const maintenance_date: Date[] = [];

  //    Filtered data
  const filtered_data = filter(data, [
    (v: CaloricProfile) => date_filter(v, today, 365),
    data_filter,
  ]);

  for (let i = 1; i < filtered_data.length; i = i + 1) {
    const p1 = filtered_data[i - 1];
    const p2 = filtered_data[i];
    //    1- Get days between 2 dates: days_between = d2 - d1
    const days_between_p1_p2 = days_between(p1.date, p2.date);
    //        1.1- If days > 3: skip
    if (days_between_p1_p2 > MAX_DAYS_DIFFERENCE) {
      continue;
    }

    //    2- Get average weight gain/day: avg_weight_per_day = (w2 - w1) / days_between
    //    ! weight is certain to be defined because it was previously filtered
    const avg_weight_per_day = (p2.weight! - p1.weight!) / days_between_p1_p2;

    //    3- Get average caloric change for that weight change: avg_cal_change_per_day = avg_weight_per_day * 3500
    const avg_cal_change_per_day = avg_weight_per_day * CALORIES_PER_POUND;

    //    4.1- Estimate maintenance: maintenance_calories_calculated = [apple_bmr | renpho_bmr | calculated_bmr] + active_energy) **(for each day in between)
    const bmr =
      p1.apple_bmr !== undefined
        ? p1.apple_bmr
        : p1.renpho_bmr !== undefined
        ? p1.renpho_bmr
        : mifflin(p1.weight!, HEIGHT, AGE, IS_MALE);
    const maintenance_calories_calculated = bmr + p1.apple_active!;

    //    4.2- Estimate maintenance: maintenance_calories_estimate = caloric_intake - avg_cal_change_per_day **(for each day in between)
    const maintenance_calories_estimate =
      p1.caloric_intake! + -avg_cal_change_per_day;

    //    5- Push to maintenance_dataset[]
    maintenance_calculated.push(maintenance_calories_calculated);
    maintenance_estimate.push(maintenance_calories_estimate);

    //    6- Push weight to weight_dataset[]
    maintenance_weight.push(p1.weight!);

    //    7- Push date to date_dataset[]
    maintenance_date.push(p1.date);
  }

  //  Standard deviation + mean analysis
  const calculated_avg = Math.ceil(mean(maintenance_calculated));
  const calculated_std = Math.ceil(stdev_p(maintenance_calculated));

  const filtered_calculated = maintenance_calculated.filter(
    (v) => Math.abs(v - calculated_avg) <= calculated_std
  );

  const std_dev_2 = Math.ceil(stdev_p(filtered_calculated));

  const avg_2 = Math.ceil(mean(filtered_calculated));

  return {
    calculated: maintenance_calculated.map(Math.ceil),
    calculated_stats: {
      avg: calculated_avg,
      std: calculated_std,
      avg_2,
      std_2: std_dev_2,
      min: avg_2 - std_dev_2,
      max: avg_2 + std_dev_2,
    },
    estimated: maintenance_estimate.map(Math.ceil),
    weight: maintenance_weight,
    date: maintenance_date,
  };
};

const data_filter = (d: CaloricProfile) => {
  if (
    d.weight === undefined ||
    d.caloric_intake === undefined ||
    d.caloric_maximum_intake === undefined ||
    d.apple_active === undefined
  ) {
    return false;
  }

  if (d.caloric_intake - d.caloric_maximum_intake > MIN_CALORIC_DIFFERENCE) {
    return true;
  }

  return false;
};

const date_filter = (a: CaloricProfile, d: Date, days_passed: number) => {
  if (days_between(a.date, d) > days_passed) {
    return false;
  } else {
    return true;
  }
};

function mifflin(m: number, h: number, a: number, male: boolean) {
  function lbs2kg(kg: number) {
    return kg / 2.205;
  }

  const s = male ? 5 : -151;

  return 10 * lbs2kg(m) + 6.25 * h - 5 * a + s;
}

const plot = (data: {
  calculated: number[];
  estimated: number[];
  weight: number[];
  date: Date[];
}) => {
  const maintenance_calculated: Plot = {
    y: data.calculated,
    x: data.weight,
    type: "scatter",
    name: "Calculated Maintenance",
  };

  const maintenance_estimated: Plot = {
    y: data.estimated,
    x: data.weight,
    type: "scatter",
    name: "Estimated Maintenance",
  };

  nodePlotLib([maintenance_calculated, maintenance_estimated]);
};

export { analysis, plot };
