import { open, rm, stat } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function acquireProcessLock(
  name,
  { timeoutMs = 300_000, staleMs = 600_000 } = {},
) {
  const lockPath = join(tmpdir(), `${name}.lock`);
  const startedAt = Date.now();

  while (true) {
    try {
      const handle = await open(lockPath, "wx");
      await handle.writeFile(`${process.pid}\n`);
      let released = false;

      const releaseOnExit = () => {
        if (!released) rmSync(lockPath, { force: true });
      };
      process.once("exit", releaseOnExit);

      return async () => {
        if (released) return;
        released = true;
        process.removeListener("exit", releaseOnExit);
        await handle.close();
        await rm(lockPath, { force: true });
      };
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;

      try {
        const lockStat = await stat(lockPath);
        if (Date.now() - lockStat.mtimeMs > staleMs) {
          await rm(lockPath, { force: true });
          continue;
        }
      } catch (statError) {
        if (statError?.code === "ENOENT") continue;
        throw statError;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        throw new Error(`Timed out waiting for validation lock ${lockPath}`);
      }
      await wait(100);
    }
  }
}