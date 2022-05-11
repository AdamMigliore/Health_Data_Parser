import { parse } from "./transformer.js";

const INPUT = "./data/raw/export.xml";
const OUTPUT = "./data/transformed/apple.json";

const apple = async () => {
  parse(INPUT, OUTPUT);
};

apple();
