/**
 * Blocks the running program for a given amount of milliseconds.
 * Done by returning a Promise with resolve callback with setTimeout.
 *
 * @param ms Amount of time in milliseconds
 *
 * @example
 * async function wait500msThenLog() {
 *  console.log("starting sleep");
 *  await sleep(500);
 *  console.log("Done sleeping for 500ms");
 * }
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
