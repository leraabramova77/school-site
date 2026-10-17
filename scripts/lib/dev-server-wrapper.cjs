// Обёртка `pnpm wt serve` для Windows: там у detached-процесса теряется вывод в файл, поэтому detached запускается
// эта обёртка, а она держит `pnpm dev` на трубах и дописывает его вывод в журнал. Остановка — taskkill /T по её pid.
//   node dev-server-wrapper.cjs <журнал>
const { spawn } = require("node:child_process");
const fs = require("node:fs");

const log = process.argv[2];
const write = (data) => fs.appendFileSync(log, data);
process.on("uncaughtException", (error) => {
  write(`\n[wt] обёртка упала: ${error.stack}\n`);
  process.exit(1);
});

const child = spawn("pnpm dev", {
  shell: true,
  windowsHide: true,
  stdio: ["ignore", "pipe", "pipe"],
});
child.stdout.on("data", write);
child.stderr.on("data", write);
child.on("error", (error) =>
  write(`\n[wt] не удалось запустить pnpm dev: ${error.message}\n`),
);
child.on("exit", (code) => {
  write(`\n[wt] pnpm dev завершился, код ${code}\n`);
  process.exit(code ?? 0);
});
