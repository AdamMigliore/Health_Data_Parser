import { csv_to_js } from "./csv_to_json";
import { export_json } from "../utils/export";

const filename = "./data/raw/renpho.csv";
const output = "./data/transformed/renpho.json";

const main = async () => {
  // Renpho
  const renpho = await csv_to_js(filename);
  await export_json(output, renpho);
};

main();
