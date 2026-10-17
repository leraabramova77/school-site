// Падает, если в коде или .env.example есть NEXT_PUBLIC_* с SECRET/KEY/TOKEN/PASSWORD/PEPPER в имени.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { findSecretPublicEnv } from "./lib/publicEnv";

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  {
    encoding: "utf8",
  },
)
  .split("\n")
  .filter((file) => /\.(ts|tsx|js|mjs|cjs|json)$|^\.env\.example$/.test(file))
  .filter((file) => !file.startsWith("scripts/lib/publicEnv"));

const problems = files.flatMap((file) =>
  findSecretPublicEnv(readFileSync(file, "utf8")).map(
    (name) => `${file}: ${name}`,
  ),
);

if (problems.length > 0) {
  console.error(
    "✖ Секрет в публичной переменной NEXT_PUBLIC_* — она попадёт в браузер:",
  );
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log("✔ NEXT_PUBLIC_* без секретов");
