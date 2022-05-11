import fs from "fs";
import { isDevelopment } from "../config/config";
import { analysis, plot } from "./analysis";
import { data_to_days } from "./utils/data_to_days";

const APPLE_DATA_FILE = "./data/transformed/apple.json";
const MFP_DATA_FILE = "./data/transformed/mfp.json";
const RENPHO_DATA_FILE = "./data/transformed/renpho.json";

const analyze = async () => {
  const rapple = await fs.readFileSync(APPLE_DATA_FILE, "utf-8");
  const rmfp = await fs.readFileSync(MFP_DATA_FILE, "utf-8");
  const rrenpho = await fs.readFileSync(RENPHO_DATA_FILE, "utf-8");

  const apple = JSON.parse(rapple);
  const mfp = JSON.parse(rmfp);
  const renpho = JSON.parse(rrenpho);

  const mapped = data_to_days(apple, mfp, renpho);

  mapped.sort((a, b) => (a.date > b.date ? -1 : 1));

  const analyzed_data = analysis(mapped);

  plot(analyzed_data);

  isDevelopment && console.log(analyzed_data);
};

analyze();
