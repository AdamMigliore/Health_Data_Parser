import { mfp } from "./scraper";
import { creds } from "../config/config";

const output = "./data/transformed/out.json";

const main = async () => {
  // MFP
  const today = new Date();
  await mfp(creds, today.toLocaleDateString("en-CA"), 365, output);
};

main();
