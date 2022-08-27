import fs from "fs";
import expat from "node-expat";
import { performance } from "perf_hooks";
import { isDevelopment } from "../config/config";
import AppleDataModel from "../models/Apple";
import { export_json } from "../utils/export";
import { to_time } from "../utils/format_timer";

//  https://stackoverflow.com/questions/52314871/parsing-large-xml-files-1g-in-node-js
//  https://github.com/astro/node-expat

//  Indexed by date (yyyy-mm-dd)
const hmap = new Map<string, HMapEntry>();

export interface HMapEntry {
  date: Date;
  activeEnergyBurned: number;
  basalEnergyBurned: number;
}

const parse = async (filename: string, output: string) => {
  const start = performance.now();
  const stream = fs.createReadStream(filename);
  const parser = new expat.Parser("UTF-8");

  //  1- Parse
  stream.pipe(parser);

  parser.on("startElement", (data, attrs) => {
    //  2- Filter
    if (
      data === "Record" &&
      [
        "HKQuantityTypeIdentifierActiveEnergyBurned",
        "HKQuantityTypeIdentifierBasalEnergyBurned",
      ].includes(attrs.type) &&
      attrs.sourceName.match(/[Aa]dam.*/)
    ) {
      //  3- Transform
      const { type, creationDate, sourceName, value, startDate, endDate } =
        attrs;
      const rec: AppleDataModel = {
        type,
        creationDate: new Date(creationDate),
        sourceName,
        value: Number.parseFloat(value),
        startDate,
        endDate,
      };

      //  4- Aggregate
      aggregate(rec);
    }
  });

  parser.on("error", (err) => {
    console.error(err);
  });

  parser.on("end", async () => {
    //  5- export (we need to aggregate the data per day)
    const data: HMapEntry[] = [];
    for (const [key, value] of hmap.entries()) {
      data.push(value);
    }
    await export_json(output, data);
    const end = performance.now();

    isDevelopment &&
      console.info(`Apple:\n\tTime Elapsed:${to_time(end - start)}\n`);
  });
};

// TODO: Review this code
const aggregate = (entry: AppleDataModel) => {
  //  Get HMapEntry
  const key = to_key(entry.endDate);
  //const key = entry.creationDate.toISOString().substring(0, 10);

  const existing_entry = hmap.get(key);

  if (existing_entry === undefined) {
    const new_entry: HMapEntry = {
      date: new Date(key),
      activeEnergyBurned: 0,
      basalEnergyBurned: 0,
    } as HMapEntry;

    if (entry.type === "HKQuantityTypeIdentifierActiveEnergyBurned") {
      new_entry.activeEnergyBurned += entry.value;
    } else if (entry.type === "HKQuantityTypeIdentifierBasalEnergyBurned") {
      new_entry.basalEnergyBurned += entry.value;
    }

    hmap.set(key, new_entry);
  } else {
    if (entry.type === "HKQuantityTypeIdentifierActiveEnergyBurned") {
      existing_entry.activeEnergyBurned += entry.value;
    } else if (entry.type === "HKQuantityTypeIdentifierBasalEnergyBurned") {
      existing_entry.basalEnergyBurned += entry.value;
    }
  }
};

const to_key = (date: string) => {
  return date.substring(0, 10);
};

export { parse };
