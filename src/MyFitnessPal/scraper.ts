import puppeteer from "puppeteer";
import cluster, { Worker } from "cluster";
import { exit } from "process";
import { performance } from "perf_hooks";
import MFPDataModel from "../models/MyFitnessPal";
import { isDevelopment } from "../config/config";
import { export_json } from "../utils/export";
import { days_to_ms } from "../utils/days_to_ms";
import { to_time } from "../utils/format_timer";

//  https://blog.logrocket.com/a-complete-guide-to-threads-in-node-js-4fa3898fe74f/
//  https://nodejs.org/api/cluster.html

const MFP_DIARY_URL = "https://www.myfitnesspal.com/food/diary";
const DAYS_PER_BATCH = 60;

interface Credential {
  username: string;
  password: string;
}

interface WorkerMsg {
  type: "complete" | string;
  data: MFPDataModel[];
}

interface MasterMsg {
  type: "mfp_params" | string;
  data: {
    creds: Credential;
    starting: string;
    days: number;
  };
}

async function mfp(
  creds: Credential,
  starting: string,
  days = 365,
  output: string
) {
  let worker: Worker;

  const data: MFPDataModel[] = [];
  const wdate = new Date(starting);

  let days_to_count = DAYS_PER_BATCH;
  let days_left = days;

  let worker_count = Math.ceil(days / DAYS_PER_BATCH);
  let finished_count = 0;

  if (cluster.isMaster) {
    //  * We will need Math.ceil(days / DAYS) processes to do the work
    for (let i = 0; i < worker_count; i = i + 1) {
      const days_offset = i * DAYS_PER_BATCH;

      //  We add an extra day because JS dates are fun to work with
      const pdate = new Date(
        wdate.getTime() - days_to_ms(days_offset) + days_to_ms(1)
      );

      const params: MasterMsg = {
        type: "mfp_params",
        data: {
          creds,
          starting: pdate.toLocaleDateString("en-CA"),
          days: days_to_count,
        },
      };

      //  Create worker
      worker = cluster.fork();

      worker.send(params);

      worker.on("message", async (msg: WorkerMsg) => {
        if (msg.type == "complete") {
          data.push(...msg.data);
          finished_count++;
          if (finished_count == worker_count) {
            data.sort((a, b) => (a.date > b.date ? -1 : 1));

            await export_json(output, data);
          }
        } else {
          console.error(`Message Error: type ${msg.type} is unknown.`);
          exit(1);
        }
      });

      //  Count days left
      days_left -= days_to_count;

      if (days_left < DAYS_PER_BATCH) {
        days_to_count = days_left;
      }
    }
  } else {
    process.on("message", async (msg: MasterMsg) => {
      if (msg.type == "mfp_params") {
        const { creds, starting, days } = msg.data;

        const start = performance.now();
        const data = await scrape(creds, starting, days);
        const end = performance.now();

        isDevelopment &&
          console.info(
            `Worker #${
              cluster.worker?.id
            }: \n\tStarting: ${starting}\n\tDays: ${days}\n\tTime: ${to_time(
              end - start
            )} ms`
          );

        (process as any).send({ type: "complete", data });
        process.exit(0);
      } else {
        console.error(
          `Message Error <wid:${cluster.worker?.id}>: type ${msg.type} is unknown.`
        );
        process.exit(1);
      }
    });
  }
}

async function scrape(creds: Credential, starting: string, days: number) {
  const browser = await puppeteer.launch({
    headless: isDevelopment ? false : true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 720 });

  // Redirect to login page
  await page.goto("https://www.myfitnesspal.com/account/login");

  await page.type("#email", creds.username);
  await page.type("#password", creds.password);

  const loginButton = await page.$('button[type="submit"]');
  await loginButton?.click();
  await page.waitForNavigation();

  let date = new Date(starting);
  date.setTime(date.getTime() + days_to_ms(1));

  const mfps: MFPDataModel[] = [];

  for (let i = 0; i < days; i = i + 1) {
    await page.goto(build_url_for_date(date.toLocaleDateString("en-CA")));

    const total_el = await page.$(
      "#diary-table > tbody > tr.total > td:nth-child(2)"
    );

    const total_str = (await (
      await total_el?.getProperty("textContent")
    )?.jsonValue()) as string;

    const daily_total_el = await page.$(
      "#diary-table > tbody > tr.total.alt > td:nth-child(2)"
    );

    const daily_total_str = (await (
      await daily_total_el?.getProperty("textContent")
    )?.jsonValue()) as string;

    let mfp: MFPDataModel = {
      date: new Date(date.getTime()),
      total: Number.parseInt(total_str.replace(",", "")),
      daily_total: Number.parseInt(daily_total_str.replace(",", "")),
    };

    mfps.push(mfp);

    date.setTime(date.getTime() - days_to_ms(1));
  }

  await browser.close();

  return mfps;
}

function build_url_for_date(date: string) {
  return `${MFP_DIARY_URL}?date=${date}`;
}

export { mfp, Credential };
