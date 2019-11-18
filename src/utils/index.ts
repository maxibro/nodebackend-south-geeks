import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const statAsync = promisify(fs.stat);
const readFileAsync = promisify(fs.readFile);
const fileExistAsync = promisify(fs.exists);
const delayAsync = promisify(setTimeout);
export { execAsync, statAsync, readFileAsync, fileExistAsync, delayAsync };
