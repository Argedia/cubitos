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
  await expect(recipient.locator('.full-rule img[alt="blancos"]')).toHaveCount(
    1,
  );
  await expect(recipient.locator('.full-rule img[alt="verdes"]')).toHaveCount(
    1,
  );
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
      .locator(".effect-line")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(16);
});

test("consultation integrates the effect, example and manual sources without a second clarification block", async ({
  page,
}) => {
  await page.goto("/#p1=race-4");
  await page
    .getByRole("button", {
      name: "Ver regla completa de The Big Cheese",
      exact: true,
    })
    .click();
  const content = page.locator(".full-rule");
  await expect(content).toContainText("elige entre ganar");
  await expect(content).toContainText("redondeando hacia abajo");
  await expect(content).toContainText("No sumes las dos opciones");
  await expect(
    content.getByRole("heading", { name: "Ejemplo", exact: true }),
  ).toBeVisible();
  await expect(content.locator('img[alt="fans"]')).not.toHaveCount(0);
  await expect(page.locator(".clarification")).toHaveCount(0);
  await page.locator(".consultation-sources summary").click();
  await expect(
    page.getByRole("link", { name: "Manual · p. 15 ↗", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Efecto traducido/ }),
  ).toBeVisible();
});

test("card rows keep the translated effect groups, price and colored identity", async ({
  page,
}) => {
  await page.goto("/#p1=race-4");
  const batter = page.locator('[data-id="batter-beaver"]');
  await expect(batter.locator(".effect-line")).toHaveCount(2);
  await expect(batter.locator(".effect-line").first()).toContainText(
    "Elige 2 dados de la zona de robo",
  );
  await expect(batter.locator(".effect-line").nth(1)).toContainText(
    "se ganó cualquier",
  );
  await expect(batter.locator(".card-heading .cost")).toContainText("5");
  expect(
    await batter.evaluate(
      (element) =>
        getComputedStyle(element.closest(".card-slot")).borderLeftWidth,
    ),
  ).toBe("6px");
  const columns = await page
    .locator(".cards-grid")
    .evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length,
    );
  const width = await page.evaluate(() => innerWidth);
  expect(columns).toBe(width >= 700 ? 2 : 1);
});

test("compact controls filter multiple timings and sort the visible cards", async ({
  page,
}) => {
  await page.goto("/#p1=race-4");
  await expect(page.locator(".table-controls")).toContainText("Filtros");
  await expect(page.locator(".table-controls")).toContainText("Ordenar");

  await page.locator(".filter-menu summary").click();
  await page.locator('[data-action="filter-all"]').uncheck();
  await expect(page.locator(".filter-menu")).toHaveAttribute("open", "");
  await expect(page.locator(".cards-grid .card-slot")).toHaveCount(0);
  await page.locator('[data-action="filter"][data-phase="Correr"]').check();
  await expect(page.locator(".filter-menu")).toHaveAttribute("open", "");
  const runCards = await page.locator(".cards-grid .card-slot").count();
  expect(runCards).toBeGreaterThan(0);
  await page.locator('[data-action="filter"][data-phase="Activo"]').check();
  expect(
    await page.locator(".cards-grid .card-slot").count(),
  ).toBeGreaterThanOrEqual(runCards);

  await page.locator(".order-menu summary").click();
  await page.locator('[data-action="order"][value="name"]').check();
  const names = await page.locator(".card-heading strong").allTextContents();
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "es")));
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
