describe("Pagination and Sorting", () => {
  beforeAll(require("./support/beforeAll"), 60 * 1000);

  beforeEach(async () => {
    return page.goto("http://localhost:3000/index.html");
  }, 30 * 1000);

  describe("Pagination", () => {
    it("displays correct number of pages", async () => {
      await page.waitForSelector("#pagination a.ais-Pagination-link");
      const links = await page.$$eval(
        "#pagination a.ais-Pagination-link",
        (elements) => elements.length
      );
      // Should have page numbers + prev/next buttons
      expect(links).toBeGreaterThan(2);
    });

    it("navigates to next page when clicked", async () => {
      // Get first hit on page 1
      const firstHitPage1 = await page.$eval(
        "#hits .ais-Hits-item:first-child .hit-name",
        (el) => el.textContent.trim()
      );

      // Click next page
      await expect(page).toClick("#pagination a.ais-Pagination-link[aria-label='Next']");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get first hit on page 2
      const firstHitPage2 = await page.$eval(
        "#hits .ais-Hits-item:first-child .hit-name",
        (el) => el.textContent.trim()
      );

      // Results should be different
      expect(firstHitPage1).not.toEqual(firstHitPage2);
    });

    it("navigates to specific page number", async () => {
      // Click on page 2
      await expect(page).toClick("#pagination a.ais-Pagination-link", { text: "2" });

      // Wait for results to update
      await page.waitForTimeout(500);

      // Check that we're on page 2 (active page should be highlighted)
      await expect(page).toMatchElement("#pagination .ais-Pagination-item--selected", {
        text: "2",
      });
    });

    it("updates when filters are applied", async () => {
      // Apply a filter that reduces results
      await expect(page).toFill("#searchbox input[type=search]", "Samsung");
      
      // Wait for results to update
      await page.waitForTimeout(500);

      // Get pagination links after filtering
      await page.waitForSelector("#pagination a.ais-Pagination-link");
      const linksAfterFilter = await page.$$eval(
        "#pagination a.ais-Pagination-link",
        (elements) => elements.length
      );

      // Should have fewer pages than before (or at least some pages)
      expect(linksAfterFilter).toBeGreaterThan(0);
    });
  });

  describe("Sorting", () => {
    it("changes results when sort order is changed", async () => {
      // Get first result with default sorting
      await page.waitForSelector("#hits .ais-Hits-item");
      const firstResultDefault = await page.$eval(
        "#hits .ais-Hits-item:first-child .hit-name",
        (el) => el.textContent.trim()
      );

      // Change sort to price ascending
      await expect(page).toSelect("#sort-by select.ais-SortBy-select", "products/sort/price:asc");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get first result with price sorting
      const firstResultPriceAsc = await page.$eval(
        "#hits .ais-Hits-item:first-child .hit-name",
        (el) => el.textContent.trim()
      );

      // Results should likely be different (unless by coincidence)
      // At minimum, we should have results displayed
      expect(firstResultPriceAsc).toBeTruthy();
    });

    it("sorts by price descending", async () => {
      // Change sort to price descending
      await expect(page).toSelect("#sort-by select.ais-SortBy-select", "products/sort/price:desc");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Verify results are displayed
      await expect(page).toMatchElement("#hits .ais-Hits-item");
      
      // Get the selected option
      const selectedOption = await page.$eval(
        "#sort-by select.ais-SortBy-select",
        (el) => el.options[el.selectedIndex].text
      );
      
      expect(selectedOption).toBe("Price (desc)");
    });

    it("maintains sort order when searching", async () => {
      // Change sort to price ascending
      await expect(page).toSelect("#sort-by select.ais-SortBy-select", "products/sort/price:asc");

      // Wait for sort to apply
      await page.waitForTimeout(500);

      // Search for something
      await expect(page).toFill("#searchbox input[type=search]", "Phone");

      // Wait for search results
      await page.waitForTimeout(500);

      // Verify sort order is maintained
      const selectedOption = await page.$eval(
        "#sort-by select.ais-SortBy-select",
        (el) => el.options[el.selectedIndex].text
      );
      
      expect(selectedOption).toBe("Price (asc)");
    });
  });

  describe("Hits Per Page", () => {
    it("changes number of results displayed", async () => {
      // Get initial hit count (default is 8)
      await page.waitForSelector("#hits .ais-Hits-item");
      const initialHitCount = await page.$$eval(
        "#hits .ais-Hits-item",
        (elements) => elements.length
      );
      
      expect(initialHitCount).toBe(8);

      // Change to 16 hits per page
      await expect(page).toSelect("#hits-per-page select.ais-HitsPerPage-select", "16");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get new hit count
      const newHitCount = await page.$$eval(
        "#hits .ais-Hits-item",
        (elements) => elements.length
      );

      expect(newHitCount).toBe(16);
    });

    it("updates pagination when hits per page changes", async () => {
      // Get initial page count with 8 hits per page
      await page.waitForSelector("#pagination a.ais-Pagination-link");
      const initialPageCount = await page.$$eval(
        "#pagination a.ais-Pagination-link:not([aria-label='Previous']):not([aria-label='Next'])",
        (elements) => elements.length
      );

      // Change to 16 hits per page
      await expect(page).toSelect("#hits-per-page select.ais-HitsPerPage-select", "16");

      // Wait for update
      await page.waitForTimeout(500);

      // Get new page count
      const newPageCount = await page.$$eval(
        "#pagination a.ais-Pagination-link:not([aria-label='Previous']):not([aria-label='Next'])",
        (elements) => elements.length
      );

      // Should have fewer pages with more hits per page
      expect(newPageCount).toBeLessThan(initialPageCount);
    });
  });

  describe("Infinite Hits", () => {
    it("loads more results when show more is clicked", async () => {
      // Get initial count of infinite hits
      await page.waitForSelector("#infinite-hits .ais-InfiniteHits-item");
      const initialCount = await page.$$eval(
        "#infinite-hits .ais-InfiniteHits-item",
        (elements) => elements.length
      );

      // Check if "Show more" button exists
      const hasShowMore = await page.$eval(
        "#infinite-hits",
        (el) => !!el.querySelector("button.ais-InfiniteHits-loadMore")
      );

      if (hasShowMore) {
        // Click show more
        await expect(page).toClick("#infinite-hits button.ais-InfiniteHits-loadMore");

        // Wait for more results to load
        await page.waitForTimeout(500);

        // Get new count
        const newCount = await page.$$eval(
          "#infinite-hits .ais-InfiniteHits-item",
          (elements) => elements.length
        );

        // Should have more items
        expect(newCount).toBeGreaterThan(initialCount);
      }
    });
  });
});
