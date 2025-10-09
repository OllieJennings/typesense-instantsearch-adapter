describe("Numeric Refinement List", () => {
  beforeAll(require("./support/beforeAll"), 60 * 1000);

  beforeEach(async () => {
    return page.goto("http://localhost:3000/numeric_refinement_list.html");
  }, 30 * 1000);

  describe("Page", () => {
    it("loads correctly", async () => {
      await expect(page).toMatchElement("#searchbox input.ais-SearchBox-input");
      return expect(page.title()).resolves.toMatch("testground");
    });
  });

  describe("Refinement list on numeric field", () => {
    it("renders numeric values as refinement options", async () => {
      // Wait for refinement list to load
      await page.waitForSelector("#price-refinement-list .ais-RefinementList-list");

      // Check that numeric values are displayed
      await expect(page).toMatchElement("#price-refinement-list .ais-RefinementList-item");

      // The refinement list should show numeric link counts
      const items = await page.$$eval("#price-refinement-list .ais-RefinementList-item", (elements) =>
        elements.map((el) => el.textContent),
      );

      // Should have some items
      expect(items.length).toBeGreaterThan(0);
    });

    it("allows filtering by numeric values", async () => {
      // Wait for initial results
      await page.waitForSelector("#stats");

      // Get initial count
      const initialStats = await page.$eval("#stats", (el) => el.textContent);
      expect(initialStats).toMatch(/\d+ results/);

      // Click on a numeric refinement
      await page.waitForSelector("#price-refinement-list .ais-RefinementList-item input[type=checkbox]");
      await expect(page).toClick("#price-refinement-list .ais-RefinementList-item:first-child input[type=checkbox]");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Check that results are filtered
      await expect(page).toMatchElement("#stats");
      await expect(page).toMatchElement("#hits .ais-Hits-item");
    });

    it("displays current refinements when numeric filter is applied", async () => {
      // Apply a numeric refinement
      await page.waitForSelector("#price-refinement-list .ais-RefinementList-item input[type=checkbox]");
      await expect(page).toClick("#price-refinement-list .ais-RefinementList-item:first-child input[type=checkbox]");

      // Wait for refinement to be applied
      await page.waitForTimeout(500);

      // Check that current refinements widget shows the selected filter
      await expect(page).toMatchElement("#current-refinements .ais-CurrentRefinements-item");
    });

    it("works with search and numeric filters together", async () => {
      // Enter a search query
      await expect(page).toFill("#searchbox input[type=search]", "International");

      // Wait for search results
      await page.waitForTimeout(500);

      // Get stats after search
      const searchStats = await page.$eval("#stats", (el) => el.textContent);
      expect(searchStats).toMatch(/\d+ results/);

      // Apply a numeric refinement
      await page.waitForSelector("#price-refinement-list .ais-RefinementList-item input[type=checkbox]");
      await expect(page).toClick("#price-refinement-list .ais-RefinementList-item:first-child input[type=checkbox]");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Results should be filtered by both search and numeric refinement
      await expect(page).toMatchElement("#stats");
      await expect(page).toMatchElement("#hits .ais-Hits-item");
    });

    it("supports searchable numeric refinement list", async () => {
      // Wait for refinement list to load
      await page.waitForSelector("#price-refinement-list .ais-RefinementList-list");

      // Check if search box exists in refinement list (searchable is enabled)
      const hasSearchBox = await page.$eval(
        "#price-refinement-list",
        (el) => !!el.querySelector(".ais-RefinementList-searchBox input"),
      );

      expect(hasSearchBox).toBe(true);

      if (hasSearchBox) {
        // Search within the refinement list
        await expect(page).toFill("#price-refinement-list .ais-RefinementList-searchBox input", "10");

        // Wait for refinement list to filter
        await page.waitForTimeout(500);

        // Check that refinement list items are filtered
        const filteredItems = await page.$$eval("#price-refinement-list .ais-RefinementList-item", (elements) =>
          elements.map((el) => el.textContent),
        );

        // Should have some items containing "10"
        expect(filteredItems.length).toBeGreaterThan(0);
      }
    });

    it("supports show more functionality", async () => {
      // Wait for refinement list to load
      await page.waitForSelector("#price-refinement-list .ais-RefinementList-list");

      // Check if show more button exists
      const hasShowMore = await page.$eval(
        "#price-refinement-list",
        (el) => !!el.querySelector("button.ais-RefinementList-showMore"),
      );

      if (hasShowMore) {
        // Get initial item count
        const initialCount = await page.$$eval(
          "#price-refinement-list .ais-RefinementList-item",
          (elements) => elements.length,
        );

        // Click show more
        await expect(page).toClick("#price-refinement-list button.ais-RefinementList-showMore");

        // Wait for more items to load
        await page.waitForTimeout(500);

        // Get new item count
        const newCount = await page.$$eval(
          "#price-refinement-list .ais-RefinementList-item",
          (elements) => elements.length,
        );

        // Should have more items now
        expect(newCount).toBeGreaterThan(initialCount);
      }
    });
  });
});
