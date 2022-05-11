//  Convert a CSV file to a JSON object by providing the interface to convert to
import fs from "fs";
import readline from "readline";
import RenphoDataModel from "../models/Renpho";

async function csv_to_js(filename: string): Promise<RenphoDataModel[]> {
  const stream = fs.createReadStream(filename);

  const rline = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const objs: RenphoDataModel[] = [];

  for await (const line of rline) {
    const tokens = line.split(",");

    const obj: RenphoDataModel = {
      time_of_measurement: new Date(tokens[0]),
      weight: Number.parseFloat(tokens[2]),
      bmi: Number.parseFloat(tokens[3]),
      body_fat: Number.parseFloat(tokens[4]),
      fat_free_body_weight: Number.parseFloat(tokens[5]),
      subcutaneous_fat: Number.parseFloat(tokens[6]),
      visceral_fat: Number.parseFloat(tokens[7]),
      body_water: Number.parseFloat(tokens[8]),
      skeletal_muscle: Number.parseFloat(tokens[9]),
      muscle_mass: Number.parseFloat(tokens[10]),
      bone_mass: Number.parseFloat(tokens[11]),
      protein: Number.parseFloat(tokens[12]),
      bmr: Number.parseFloat(tokens[13]),
      metabolic_age: Number.parseFloat(tokens[14]),
    };

    objs.push(obj);
  }

  rline.close();

  return objs;
}

export { csv_to_js };
