// Демо-доступ без хостинга, пока нет Vercel: рабочая сборка `main` на этом компьютере + бесплатный туннель Cloudflare
// (без аккаунта) + постоянная ссылка https://leraabramova77.github.io/school-site/app/ на текущий адрес туннеля.
//
//   pnpm demo          — собрать свежий main, запустить сервер и туннель, обновить ссылку на Pages
//   pnpm demo stop     — остановить сервер и туннель
//   pnpm demo status   — что запущено и по какому адресу
//
// Сборка живёт в ../school-site-demo (не git): там же .env.production со своим SESSION_SECRET (создаётся один раз,
// не выводится), журналы и state.json. Компьютер должен быть включён и не спать, пока демо нужно.
// После переезда на Vercel: gh variable set APP_URL --body https://<проект>.vercel.app && gh workflow run pages.yml,
// а демо остановить — ссылка на Pages останется той же.
import { execFileSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEMO_DIR = path.resolve(ROOT, "..", "school-site-demo");
const STATE = path.join(DEMO_DIR, "state.json");
const ENV_FILE = path.join(DEMO_DIR, ".env.production");
const START_PORT = 5100;
const CLOUDFLARED =
  process.env.CLOUDFLARED ??
  path.join(
    os.homedir(),
    "bin",
    process.platform === "win32" ? "cloudflared.exe" : "cloudflared",
  );
const isWin = process.platform === "win32";

type State = {
  serverPid: number;
  tunnelPid: number;
  port: number;
  url: string;
};

function log(message: string) {
  console.log(`[demo] ${message}`);
}

function run(command: string, args: string[], cwd = DEMO_DIR) {
  // pnpm и gh на Windows — .cmd/.exe; через shell надёжнее. Аргументы — только наши константы и URL туннеля.
  execFileSync(command, args, { cwd, stdio: "inherit", shell: isWin });
}

function readState(): State | null {
  try {
    return JSON.parse(readFileSync(STATE, "utf8")) as State;
  } catch {
    return null;
  }
}

/** Жив ли процесс. После перезагрузки state.json остаётся, а процессов уже нет. */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function kill(pid: number) {
  if (!alive(pid)) return;
  try {
    if (isWin)
      execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
      });
    else process.kill(-pid);
  } catch {
    // Уже остановлен.
  }
}

function stop() {
  const state = readState();
  if (!state) return log("ничего не запущено");
  kill(state.tunnelPid);
  kill(state.serverPid);
  rmSync(STATE, { force: true });
  log("сервер и туннель остановлены");
}

function isFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

async function freePort(): Promise<number> {
  for (let port = START_PORT; port < START_PORT + 50; port++) {
    if (await isFree(port)) return port;
  }
  throw new Error("нет свободного порта от 5100");
}

/** Свежий main без истории git; .env.production с секретом сессии переживает пересборку. */
function prepareBuild() {
  const env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : null;
  rmSync(DEMO_DIR, { recursive: true, force: true });
  mkdirSync(DEMO_DIR, { recursive: true });
  execFileSync("git", ["fetch", "-q", "origin", "main"], { cwd: ROOT });
  // Архив — через поток: tar из Git Bash принимает «C:» в пути за адрес удалённого хоста.
  const archive = execFileSync("git", ["archive", "origin/main"], {
    cwd: ROOT,
    maxBuffer: 512 * 1024 * 1024,
  });
  execFileSync("tar", ["-xf", "-"], { cwd: DEMO_DIR, input: archive });
  writeFileSync(
    ENV_FILE,
    env ?? `SESSION_SECRET=${randomBytes(48).toString("base64url")}\n`,
  );
  run("pnpm", ["install", "--frozen-lockfile"]);
  run("pnpm", ["build"]);
}

/** Запуск, который переживёт этот терминал: свой процесс, вывод в файл. */
function detached(command: string, args: string[], logName: string): number {
  const out = openSync(path.join(DEMO_DIR, logName), "a");
  const child = spawn(command, args, {
    cwd: DEMO_DIR,
    detached: true,
    windowsHide: true,
    shell: isWin && command === "pnpm",
    stdio: ["ignore", out, out],
  });
  child.unref();
  if (!child.pid) throw new Error(`не запустился ${command}`);
  return child.pid;
}

async function waitFor<T>(
  what: string,
  check: () => Promise<T | null> | T | null,
  seconds = 60,
): Promise<T> {
  for (let i = 0; i < seconds; i++) {
    const value = await check();
    if (value) return value;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`не дождался: ${what}`);
}

async function ok(url: string) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function start() {
  if (!existsSync(CLOUDFLARED))
    throw new Error(
      `нет ${CLOUDFLARED}: скачай cloudflared с github.com/cloudflare/cloudflared/releases или укажи путь в CLOUDFLARED`,
    );
  stop();
  log("собираю свежий main…");
  prepareBuild();

  const port = await freePort();
  const serverPid = detached(
    "pnpm",
    ["exec", "next", "start", "--port", String(port)],
    "server.log",
  );
  await waitFor("сервер", () => ok(`http://localhost:${port}/login`));
  log(`сервер: http://localhost:${port}`);

  const tunnelLog = path.join(DEMO_DIR, "tunnel.log");
  rmSync(tunnelLog, { force: true });
  const tunnelPid = detached(
    CLOUDFLARED,
    [
      "tunnel",
      "--no-autoupdate",
      "--url",
      `http://localhost:${port}`,
      "--logfile",
      tunnelLog,
    ],
    "tunnel.out.log",
  );
  const url = await waitFor("адрес туннеля", () => {
    const text = existsSync(tunnelLog) ? readFileSync(tunnelLog, "utf8") : "";
    return text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)?.[0] ?? null;
  });
  writeFileSync(
    STATE,
    JSON.stringify({ serverPid, tunnelPid, port, url } satisfies State),
  );
  await waitFor("туннель отвечает", () => ok(`${url}/login`), 90);
  log(`туннель: ${url}`);

  run("gh", ["variable", "set", "APP_URL", "--body", url], ROOT);
  run("gh", ["workflow", "run", "pages.yml", "--ref", "main"], ROOT);
  log(
    "ссылка обновится через минуту: https://leraabramova77.github.io/school-site/app/",
  );
}

function status() {
  const state = readState();
  if (!state) return log("не запущено");
  const server = alive(state.serverPid);
  const tunnel = alive(state.tunnelPid);
  const mark = (on: boolean) => (on ? "работает" : "НЕ РАБОТАЕТ");
  log(`сервер: http://localhost:${state.port} — ${mark(server)}`);
  log(`туннель: ${state.url} — ${mark(tunnel)}`);
  if (server && tunnel)
    return log("ссылка: https://leraabramova77.github.io/school-site/app/");
  log("демо остановлено (например, после перезагрузки) — запусти pnpm demo");
  process.exitCode = 1;
}

const command = process.argv[2] ?? "start";
const actions: Record<string, () => unknown> = { start, stop, status };
const action = actions[command];
if (!action) {
  console.error(`[demo] неизвестная команда ${command}: start | stop | status`);
  process.exit(1);
}
Promise.resolve(action()).catch((error: unknown) => {
  console.error(`[demo] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
