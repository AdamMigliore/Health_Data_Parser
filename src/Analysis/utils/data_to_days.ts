import { HMapEntry as AppleDataModel } from "../../Apple/transformer";
import CaloricProfile from "../../models/CaloricProfile";
import MFPDataModel from "../../models/MyFitnessPal";
import RenphoDataModel from "../../models/Renpho";

const hmap = new Map<string, CaloricProfile>();

const data_to_days = (
  apple: AppleDataModel[],
  mfp: MFPDataModel[],
  renpho: RenphoDataModel[]
): CaloricProfile[] => {
  const data: CaloricProfile[] = [];

  apple_data_to_days(apple);
  mfp_data_to_days(mfp);
  renpho_data_to_days(renpho);

  for (const v of hmap.values()) {
    data.push(v);
  }

  return data;
};

const apple_data_to_days = (apple: AppleDataModel[]) => {
  for (const a of apple) {
    const key = date_to_key(new Date(a.date));

    if (key === null) continue;

    const existing = hmap.get(key);

    if (existing === undefined) {
      const new_caloric_profile: CaloricProfile = {
        date: new Date(key),
        apple_active: a.activeEnergyBurned,
        apple_bmr: a.basalEnergyBurned,
        caloric_intake: undefined,
        caloric_maximum_intake: undefined,
        renpho_bmr: undefined,
        weight: undefined,
      };
      hmap.set(key, new_caloric_profile);
    } else {
      existing.apple_active = a.activeEnergyBurned;
      existing.apple_bmr = a.basalEnergyBurned;
    }
  }
};

const mfp_data_to_days = (mfp: MFPDataModel[]) => {
  for (const m of mfp) {
    const key = date_to_key(new Date(m.date));

    if (key === null) continue;

    const existing = hmap.get(key);

    if (existing === undefined) {
      const new_caloric_profile: CaloricProfile = {
        date: new Date(key),
        apple_active: undefined,
        apple_bmr: undefined,
        caloric_intake: m.total,
        caloric_maximum_intake: m.daily_total,
        renpho_bmr: undefined,
        weight: undefined,
      };
      hmap.set(key, new_caloric_profile);
    } else {
      existing.caloric_intake = m.total;
      existing.caloric_maximum_intake = m.daily_total;
    }
  }
};

const renpho_data_to_days = (renpho: RenphoDataModel[]) => {
  for (const r of renpho) {
    const key = date_to_key(new Date(r.time_of_measurement));

    if (key === null) continue;

    const existing = hmap.get(key);

    if (existing === undefined) {
      const new_caloric_profile: CaloricProfile = {
        date: new Date(key),
        apple_active: undefined,
        apple_bmr: undefined,
        caloric_intake: undefined,
        caloric_maximum_intake: undefined,
        renpho_bmr: r.bmr === null ? undefined : r.bmr,
        weight: r.weight,
      };
      hmap.set(key, new_caloric_profile);
    } else {
      existing.renpho_bmr = r.bmr === null ? undefined : r.bmr;
      existing.weight = r.weight;
    }
  }
};

const date_to_key = (d: Date) => {
  if (d === null) {
    return null;
  }
  return d.toISOString().substring(0, 10);
};

export { data_to_days };
