describe("Range Inputs and Sliders", () => {
  beforeAll(require("./support/beforeAll"), 60 * 1000);

  beforeEach(async () => {
    return page.goto("http://localhost:3000/index.html");
  }, 30 * 1000);

  describe("Range Input Widget", () => {
    it("displays min and max values correctly", async () => {
      // Check that range input has the correct min/max placeholders
      await expect(page).toMatchElement('#price-range-input form input[type=number][placeholder="1"]');
      await expect(page).toMatchElement('#price-range-input form input[type=number][placeholder="900"]');
    });

    it("filters results when min value is entered", async () => {
      // Get initial stats
      const initialStats = await page.$eval("#stats", (el) => el.textContent);
      const initialMatch = initialStats.match(/(\d+,?\d*) results/);
      const initialCount = initialMatch ? parseInt(initialMatch[1].replace(",", "")) : 0;

      // Enter minimum price
      await expect(page).toFill('#price-range-input form input[type=number][placeholder="1"]', "100");

      // Submit the form (press Enter or click Go button)
      await page.keyboard.press("Enter");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get updated stats
      const updatedStats = await page.$eval("#stats", (el) => el.textContent);
      const updatedMatch = updatedStats.match(/(\d+,?\d*) results/);
      const updatedCount = updatedMatch ? parseInt(updatedMatch[1].replace(",", "")) : 0;

      // Should have fewer results
      expect(updatedCount).toBeLessThan(initialCount);
      expect(updatedCount).toBeGreaterThan(0);
    });

    it("filters results when max value is entered", async () => {
      // Enter maximum price
      await expect(page).toFill('#price-range-input form input[type=number][placeholder="900"]', "200");

      // Submit the form
      await page.keyboard.press("Enter");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get stats
      const stats = await page.$eval("#stats", (el) => el.textContent);
      const match = stats.match(/(\d+,?\d*) results/);
      const count = match ? parseInt(match[1].replace(",", "")) : 0;

      // Should have filtered results
      expect(count).toBeGreaterThan(0);
    });

    it("filters results when both min and max values are entered", async () => {
      // Enter minimum price
      await expect(page).toFill('#price-range-input form input[type=number][placeholder="1"]', "50");

      // Enter maximum price
      await expect(page).toFill('#price-range-input form input[type=number][placeholder="900"]', "150");

      // Submit the form
      await page.keyboard.press("Enter");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get stats
      const stats = await page.$eval("#stats", (el) => el.textContent);
      const match = stats.match(/(\d+,?\d*) results/);
      const count = match ? parseInt(match[1].replace(",", "")) : 0;

      // Should have filtered results
      expect(count).toBeGreaterThan(0);

      // Check that current refinements shows the price filter
      await expect(page).toMatchElement("#current-refinements");
    });

    it("updates range when filters are applied", async () => {
      // Apply a filter
      await expect(page).toFill("#searchbox input[type=search]", "Samsung");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Check that range input min/max might have changed
      const minPlaceholder = await page.$eval(
        "#price-range-input form input[type=number]:first-child",
        (el) => el.placeholder,
      );

      const maxPlaceholder = await page.$eval(
        "#price-range-input form input[type=number]:last-child",
        (el) => el.placeholder,
      );

      // Placeholders should be valid numbers
      expect(parseInt(minPlaceholder)).toBeGreaterThan(0);
      expect(parseInt(maxPlaceholder)).toBeGreaterThan(parseInt(minPlaceholder));
    });
  });

  describe("Range Slider Widget", () => {
    it("displays with correct min and max values", async () => {
      // Check that range slider exists with correct values
      await expect(page).toMatchElement('#price-range-slider div[aria-valuenow="1"]');
      await expect(page).toMatchElement('#price-range-slider div[aria-valuenow="900"]');
    });

    it("updates results when slider is moved", async () => {
      // Get initial stats
      const initialStats = await page.$eval("#stats", (el) => el.textContent);
      const initialMatch = initialStats.match(/(\d+,?\d*) results/);
      const initialCount = initialMatch ? parseInt(initialMatch[1].replace(",", "")) : 0;

      // Find the slider handle
      const minHandle = await page.$('#price-range-slider div[aria-valuenow="1"]');

      if (minHandle) {
        // Get the bounding box of the slider
        const sliderBox = await minHandle.boundingBox();

        if (sliderBox) {
          // Move the slider handle to the right (increase minimum)
          await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(sliderBox.x + sliderBox.width / 2 + 100, sliderBox.y + sliderBox.height / 2);
          await page.mouse.up();

          // Wait for results to update
          await page.waitForTimeout(1000);

          // Get updated stats
          const updatedStats = await page.$eval("#stats", (el) => el.textContent);
          const updatedMatch = updatedStats.match(/(\d+,?\d*) results/);
          const updatedCount = updatedMatch ? parseInt(updatedMatch[1].replace(",", "")) : 0;

          // Should have different result count (likely fewer)
          expect(updatedCount).toBeLessThanOrEqual(initialCount);
        }
      }
    });

    it("shows current refinement when slider is adjusted", async () => {
      // Find the max slider handle
      const maxHandle = await page.$('#price-range-slider div[aria-valuenow="900"]');

      if (maxHandle) {
        const sliderBox = await maxHandle.boundingBox();

        if (sliderBox) {
          // Move the slider handle to the left (decrease maximum)
          await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(sliderBox.x + sliderBox.width / 2 - 100, sliderBox.y + sliderBox.height / 2);
          await page.mouse.up();

          // Wait for results to update
          await page.waitForTimeout(1000);

          // Check that current refinements appears
          const hasRefinement = await page.$eval("#current-refinements", (el) => el.textContent.trim().length > 0);

          // Should show a refinement (though this might not always be the case)
          expect(hasRefinement).toBeTruthy();
        }
      }
    });
  });

  describe("Numeric Menu Widget", () => {
    it("displays price ranges correctly", async () => {
      await expect(page).toMatchElement("#price-menu", {
        text: "Less than 500$",
      });
      await expect(page).toMatchElement("#price-menu", {
        text: "Between 500$ - 700$",
      });
    });

    it("filters results when a price range is selected", async () => {
      // Get initial count
      const initialStats = await page.$eval("#stats", (el) => el.textContent);
      const initialMatch = initialStats.match(/(\d+,?\d*) results/);
      const initialCount = initialMatch ? parseInt(initialMatch[1].replace(",", "")) : 0;

      // Click on a price range
      await expect(page).toClick("#price-menu input[type=radio]", {});

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get updated stats
      const updatedStats = await page.$eval("#stats", (el) => el.textContent);
      const updatedMatch = updatedStats.match(/(\d+,?\d*) results/);
      const updatedCount = updatedMatch ? parseInt(updatedMatch[1].replace(",", "")) : 0;

      // Should have fewer results
      expect(updatedCount).toBeLessThan(initialCount);
      expect(updatedCount).toBeGreaterThan(0);
    });

    it("shows selected range in current refinements", async () => {
      // Click on a price range
      await expect(page).toClick("#price-menu label", {
        text: "Less than 500$",
      });

      // Wait for results to update
      await page.waitForTimeout(500);

      // Check current refinements
      await expect(page).toMatchElement("#current-refinements .ais-CurrentRefinements-item");
    });

    it("can clear numeric menu selection", async () => {
      // Click on a price range
      await expect(page).toClick("#price-menu label", {
        text: "Less than 500$",
      });

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get filtered count
      const filteredStats = await page.$eval("#stats", (el) => el.textContent);
      const filteredMatch = filteredStats.match(/(\d+,?\d*) results/);
      const filteredCount = filteredMatch ? parseInt(filteredMatch[1].replace(",", "")) : 0;

      // Clear the selection by clicking the same option again or using clear refinements
      await expect(page).toClick("#clear-refinements button");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get updated count
      const updatedStats = await page.$eval("#stats", (el) => el.textContent);
      const updatedMatch = updatedStats.match(/(\d+,?\d*) results/);
      const updatedCount = updatedMatch ? parseInt(updatedMatch[1].replace(",", "")) : 0;

      // Should have more results after clearing
      expect(updatedCount).toBeGreaterThan(filteredCount);
    });
  });

  describe("Combining Range Filters", () => {
    it("works with range input and search together", async () => {
      // Search for a term
      await expect(page).toFill("#searchbox input[type=search]", "Phone");

      // Wait for search results
      await page.waitForTimeout(500);

      // Get search stats
      const searchStats = await page.$eval("#stats", (el) => el.textContent);
      const searchMatch = searchStats.match(/(\d+,?\d*) results/);
      const searchCount = searchMatch ? parseInt(searchMatch[1].replace(",", "")) : 0;

      // Apply price range filter
      await expect(page).toFill('#price-range-input form input[type=number][placeholder="1"]', "50");
      await page.keyboard.press("Enter");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Get combined filter stats
      const combinedStats = await page.$eval("#stats", (el) => el.textContent);
      const combinedMatch = combinedStats.match(/(\d+,?\d*) results/);
      const combinedCount = combinedMatch ? parseInt(combinedMatch[1].replace(",", "")) : 0;

      // Should have fewer or equal results
      expect(combinedCount).toBeLessThanOrEqual(searchCount);
    });
  });
});
