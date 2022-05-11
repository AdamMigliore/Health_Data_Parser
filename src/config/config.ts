import "dotenv/config";
import { Credential } from "../MyFitnessPal/scraper";

const { MFP_USERNAME = "user", MFP_PASSWORD = "pass" } = process.env;

const creds: Credential = {
  password: MFP_PASSWORD,
  username: MFP_USERNAME,
};

const isDevelopment = process.env.NODE_ENV == "DEVELOPMENT" ? true : false;

export { creds, isDevelopment };
