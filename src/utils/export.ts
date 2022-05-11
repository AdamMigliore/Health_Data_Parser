import fs from "fs";
async function export_json(filename: string, data: any) {
  await fs.writeFileSync(filename, JSON.stringify(data));
}

export { export_json };
