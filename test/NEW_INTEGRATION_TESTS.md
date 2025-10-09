# New Integration Tests

This document describes the new integration tests added to the testground folder.

## Tests Added

### 1. Numeric Refinement List Test (`numericRefinementList.test.js`)

Tests the `numeric_refinement_list.html` page which demonstrates using a refinement list widget on a numeric field (`links_count` from the airports index).

**Test Coverage:**
- Page loads correctly
- Numeric values render as refinement options
- Filtering works on numeric values
- Current refinements display when filters are applied
- Search works together with numeric filters
- Searchable refinement list functionality
- Show more/less functionality for long lists

**Key Scenarios:**
- Verifies that numeric fields can be used with refinement lists
- Tests the searchable feature within refinement lists
- Validates filter combinations (search + numeric refinement)

### 2. Pagination and Sorting Test (`paginationAndSorting.test.js`)

Tests pagination, sorting, hits per page, and infinite hits functionality on the main `index.html` page.

**Test Coverage:**

#### Pagination
- Displays correct number of pages
- Navigates to next page
- Navigates to specific page numbers
- Updates when filters are applied

#### Sorting
- Changes results when sort order is changed
- Sorts by price descending
- Maintains sort order when searching

#### Hits Per Page
- Changes number of results displayed (8 vs 16)
- Updates pagination when hits per page changes

#### Infinite Hits
- Loads more results when "show more" is clicked

**Key Scenarios:**
- Tests user navigation through search results
- Validates sorting maintains consistency during search
- Ensures hits per page affects pagination correctly

### 3. Range Filters Test (`rangeFilters.test.js`)

Tests range input, range slider, and numeric menu widgets for filtering by numeric values (price) on the main `index.html` page.

**Test Coverage:**

#### Range Input Widget
- Displays min and max values correctly
- Filters results when min value is entered
- Filters results when max value is entered
- Filters results when both min and max are entered
- Updates range when other filters are applied

#### Range Slider Widget
- Displays with correct min and max values
- Updates results when slider is moved
- Shows current refinement when slider is adjusted

#### Numeric Menu Widget
- Displays price ranges correctly
- Filters results when a price range is selected
- Shows selected range in current refinements
- Can clear numeric menu selection

#### Combined Scenarios
- Works with range input and search together

**Key Scenarios:**
- Tests different ways to filter by numeric ranges
- Validates interaction between different range filter widgets
- Ensures filters work correctly in combination with search

## Running the Tests

These tests require the testground environment and Typesense server to be running:

```bash
# Terminal 1: Start Typesense server
npm run typesenseServer

# Terminal 2: Index test data
npm run indexTestData

# Terminal 3: Run tests
npm test
```

Or use the existing test infrastructure that automatically starts the services:

```bash
npm test
```

## Test Structure

All tests follow the existing pattern:
- Use `beforeAll` to set up test data
- Use `beforeEach` to navigate to the test page
- Use `expect-puppeteer` matchers for assertions
- Wait for elements and use appropriate timeouts
- Test both individual features and combinations

## Coverage Summary

These integration tests add coverage for:
1. **Numeric refinement lists** - Previously untested scenario
2. **Pagination** - Navigate between pages, page number display
3. **Sorting** - Sort order changes and persistence  
4. **Hits per page** - Dynamic result count changes
5. **Range filters** - Input, slider, and menu variations
6. **Filter combinations** - Multiple filters working together

The tests ensure that the Typesense InstantSearch adapter correctly handles these widgets and scenarios.
