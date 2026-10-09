import { test, expect } from "@playwright/test";
test("select, share in a fresh browser, read full text and restore history", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await expect(page.locator(".card-slot")).toHaveCount(0);
  await expect(page.locator('[data-action="preset"]')).toHaveCount(10);
  await page.locator('[data-preset="race-1"]').click();
  await expect(page).toHaveURL(/#p1=race-1$/);
  await expect(page.locator('[data-action="choose"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Personalizar estas cartas" }).click();
  await expect(page).toHaveURL(/#c1=00000000$/);
  await page
    .getByRole("button", { name: "Cambiar carta rojo", exact: true })
    .click();
  await page.getByRole("searchbox").fill("Punch");
  await page.locator('[data-action="select"]').click();
  await expect(page).toHaveURL(/#c1=10000000$/);
  await page.getByRole("button", { name: "Compartir selección" }).click();
  const link = await page.locator("#share-link").inputValue();
  const context = await browser.newContext();
  const recipient = await context.newPage();
  await recipient.goto(link);
  await expect(recipient.locator(".card-slot.chosen")).toHaveCount(8);
  await recipient
    .getByRole("button", {
      name: "Ver regla completa de Punch Guy",
      exact: true,
    })
    .click();
  await expect(recipient.locator(".full-rule")).toBeVisible();
  await expect(recipient.getByText("Texto completo · español")).toBeVisible();
  await context.close();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL(/#c1=00000000$/);
  await page.reload();
  await expect(page.locator(".card-slot.chosen")).toHaveCount(8);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(
    await page
      .locator(".summary")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(16);
});
test("invalid links show an error and can be replaced with a valid selection", async ({
  page,
}) => {
  await page.goto("/#c1=88888888");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator(".card-slot")).toHaveCount(0);
  await page.locator('[data-preset="race-1"]').click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "¿Cuándo se activan?" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("preset link restores its name and eight cards; custom starts with empty slots", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await page.locator('[data-preset="race-5"]').click();
  await page.getByRole("button", { name: "Compartir selección" }).click();
  const link = await page.locator("#share-link").inputValue();
  expect(link).toContain("#p1=race-5");
  const context = await browser.newContext();
  const recipient = await context.newPage();
  await recipient.goto(link);
  await expect(recipient.locator(".selection-status")).toContainText(
    "Carrera 5",
  );
  await expect(recipient.locator(".card-heading strong")).toHaveText([
    "Champion",
    "Mr. Bats",
    "Bad Cheese",
    "Up to 11",
    "Llama Shaman",
    "You Bet Jurassican",
    "Dr. Livingstone",
    "Broken Cow",
  ]);
  await expect(recipient.locator('[data-action="choose"]')).toHaveCount(0);
  await context.close();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page
    .getByRole("button", { name: "Cambiar selección", exact: true })
    .click();
  await page.locator('[data-action="custom"]').click();
  await expect(page.locator(".card-slot.empty")).toHaveCount(8);
  await expect(
    page.getByRole("button", { name: "Compartir selección" }),
  ).toBeDisabled();
  await page.reload();
  await expect(page.locator(".card-slot.empty")).toHaveCount(8);
});
