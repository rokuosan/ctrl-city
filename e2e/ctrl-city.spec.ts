import { expect, test } from "@playwright/test";

test("loads Cesium assets and completes the city paste interaction", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  const skyboxResponse = await page.request.get(
    "/cesiumStatic/Assets/Textures/SkyBox/tycho2t3_80_px.jpg",
  );
  expect(skyboxResponse.ok()).toBe(true);
  expect(skyboxResponse.headers()["content-type"]).toContain("image/jpeg");
  expect((await skyboxResponse.body()).subarray(0, 3)).toEqual(
    Buffer.from([0xff, 0xd8, 0xff]),
  );

  await page.goto("/");
  await expect(page.locator("#cesium-container canvas")).toBeVisible();
  await expect(page.locator("#load-status-text")).toHaveText(
    "2都市のデータ接続完了",
    { timeout: 30_000 },
  );
  await expect(page.locator("#mode-before")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.locator("#rotation").fill("30");
  await expect(page.locator("#rotation-value")).toHaveText("+30°");
  await page.locator("#opacity").fill("65");
  await expect(page.locator("#opacity-value")).toHaveText("65%");

  await page.locator("#paste-button").click();
  await expect(page.locator("#copy-sequence")).toBeVisible();
  await page.waitForTimeout(2_000);
  await expect(page.locator("#copy-sequence")).toBeVisible();
  await expect(page.locator("#mode-after")).toHaveAttribute(
    "aria-pressed",
    "true",
    { timeout: 5_000 },
  );
  await expect(page.locator("#copy-sequence")).toBeHidden({ timeout: 6_000 });

  await page.locator("#mode-before").click();
  await page.keyboard.press("Control+c");
  await expect(page.locator("#copy-sequence")).toBeVisible();
  await expect(page.locator("#copy-sequence")).toHaveAttribute(
    "data-step",
    "waiting",
  );
  await expect(page.locator(".copy-sequence__prompt")).toBeVisible();
  await page.waitForTimeout(1_000);
  await expect(page.locator("#mode-before")).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.keyboard.press("Control+v");
  await expect(page.locator("#mode-after")).toHaveAttribute(
    "aria-pressed",
    "true",
    { timeout: 5_000 },
  );
  await expect(page.locator("#copy-sequence")).toBeHidden({ timeout: 8_000 });

  await page.waitForTimeout(5_000);

  expect(pageErrors).toEqual([]);
  expect(
    consoleErrors.filter((message) =>
      /source image could not be decoded|rendering has stopped/i.test(message),
    ),
  ).toEqual([]);
});
