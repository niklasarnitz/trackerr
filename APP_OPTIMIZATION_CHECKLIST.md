# Trackerr App - UX/Navigation Optimization Checklist

**Last Updated**: February 6, 2026  
**Status**: Planning Phase  
**Estimated Impact**: High - addresses core navigation and discoverability issues

---

## Overview

This document contains prioritized optimization tasks identified through comprehensive meta-review. Tasks are organized by impact and dependencies. Each task includes:

- Clear acceptance criteria
- Implementation guidance
- File references
- Estimated effort

---

## 🔴 PHASE 1: CRITICAL - Navigation & Information Architecture

### Task 1.1: Refactor Navigation Structure

**Priority**: 🔴 CRITICAL  
**Impact**: High (affects every user)  
**Effort**: Large (6-8 hours)  
**Status**: ✅ Completed

**Current Problem**:

- 11 top-level navigation items overwhelm users
- Inconsistent grouping (watchlist/favorites scattered)
- No clear hierarchy between primary and secondary features
- "History" is vague (should be "Watch History")
- "Collection" term unclear (physical media vs digital library)

**Objective**:
Restructure navigation into logical, user-mental-model groups with clear visual hierarchy.

**Implementation Details**:

1. **Rename for clarity**:
   - "History" → "Watch History"
   - "Collection" → "Library" (represents user's media library)
   - Keep "Bible" at secondary level (distinct use case)

2. **Create navigation groups** with new structure:

   ```
   PRIMARY (Always visible in top nav):
   - Dashboard (home)
   - Media Discovery (Movies | TV Shows | Books | Bible)
   - My Library (Watches | Library | Watchlists)
   - Lists (Custom Lists dropdown)

   SECONDARY (More dropdown):
   - Loans
   - Recommendations
   - Statistics
   - Settings
   ```

3. **Files to modify**:
   - `src/components/navigation.tsx` - Update navigationItems array
   - `src/components/desktop-nav-menus.tsx` - Add new grouping logic
   - `src/components/mobile-nav-menu.tsx` - Update mobile structure
   - `src/components/nav-user-menu.tsx` - Consider adding Settings/Profile here

4. **Specific code changes**:
   - Create separate arrays for `primaryNavItems`, `mediaItems`, `libraryItems`, `secondaryItems`
   - Update `DesktopNavMenus` to render groups with visual separators
   - Update `MobileNavMenu` to use accordion groups matching desktop structure
   - Add icons to ALL top-level items (already available from lucide-react)
   - Consider adding descriptive tooltips on hover

5. **Acceptance Criteria**:
   - ✅ Maximum 3-4 items visible in top nav (collapsible groups for rest)
   - ✅ Related features grouped logically
   - ✅ All nav items have icons
   - ✅ Mobile and desktop structures are parallel
   - ✅ No change in functionality, only organization
   - ✅ Navigation passes accessibility audit

6. **Testing**:
   - Test on mobile (<768px), tablet, desktop
   - Verify all routes still accessible
   - Check that active states still work
   - Verify dropdown/accordion performance

---

### Task 1.2: Add Unified Search

**Priority**: 🔴 CRITICAL  
**Impact**: High (major UX improvement)  
**Effort**: Large (6-8 hours)  
**Status**: ✅ Completed
**Dependencies**: Task 1.1 (should be in header after nav refactor)

**Current Problem**:

- Each section has separate search (movies search ≠ books search ≠ TV search)
- No way to find a movie OR a book in single query
- Users must know which type of media they're looking for
- No global discovery experience

**Objective**:
Create single unified search that spans all media types (movies, TV, books) with smart categorization of results.

**Implementation Details**:

1. **Create new server procedure**: `src/server/api/routers/search.ts`
   - Input: `query: string`, `limit: number` (default 10)
   - Output: Categorized results with media type badges
   - Search movies title/genres, TV shows title/genres, books title/author
   - Implement debounced search on client

2. **Create search dialog component**: `src/components/unified-search-dialog.tsx`
   - Header search icon opens modal/dropdown
   - Real-time results as user types
   - Results grouped by media type (Movies | TV Shows | Books)
   - Show 3-5 results per category
   - "See all X results" link to dedicated search results page
   - Keyboard shortcut: Cmd+K / Ctrl+K

3. **Create search results page**: `src/app/search/page.tsx`
   - Full results for a query
   - Category tabs to filter results
   - Pagination for each category
   - Quick filters

4. **Update navigation**:
   - Add search icon to header (left of user menu)
   - Make it prominent and easily discoverable

5. **Acceptance Criteria**:
   - ✅ Search modal opens on header icon click
   - ✅ Cmd+K / Ctrl+K opens search
   - ✅ Results appear as user types (debounced)
   - ✅ Results grouped by media type
   - ✅ Can click result to navigate to detail page
   - ✅ Dedicated search results page shows full results
   - ✅ Search field clears on result selection
   - ✅ Accessible (keyboard navigation, screen reader)

6. **Files to create/modify**:
   - Create: `src/server/api/routers/search.ts`
   - Create: `src/components/unified-search-dialog.tsx`
   - Create: `src/app/search/page.tsx`
   - Modify: `src/components/navigation.tsx` - Add search icon
   - Modify: `src/server/api/root.ts` - Register search router

---

### Task 1.3: Consolidate Watchlist/Favorites Across Media Types

**Priority**: 🔴 CRITICAL  
**Impact**: High (consistency & discoverability)  
**Effort**: Medium (4-5 hours)  
**Status**: ✅ Completed
**Dependencies**: Task 1.1 (should be after nav refactor)

**Current Problem**:

- Movies have: `/movies/watchlist` and `/movies/favorites`
- TV Shows have: No watchlist/favorites tabs
- Books have: `/books/wishlist` (different naming)
- Inconsistent UX and confusing naming

**Objective**:
Standardize watchlist/favorites terminology and features across all media types.

**Implementation Details**:

1. **Standardize terminology**:
   - Use "Watchlist" for movies/TV (to-watch)
   - Use "Wishlist" for books (to-read)
   - Use "Favorites" for all media types (already rated/watched items)
   - Update all labels and routes

2. **Add missing features**:
   - Add watchlist tab to TV Show detail page (`src/app/tv-shows/[id]/page.tsx`)
   - Add wishlist tab to Book detail page (`src/app/books/[id]/page.tsx`)
   - Add favorites tab to Book detail page
   - Add "Add to Watchlist" button to TV detail page
   - Add "Add to Wishlist" button to Book detail page

3. **Create unified watchlist page** (optional but recommended):
   - New route: `/watchlist` (combines all unwatched media)
   - Tabs for Movies, TV Shows, Books
   - Quick filters (genre, added date)
   - Bulk actions (mark as watched, remove from watchlist)

4. **Update API routes** to ensure consistency:
   - Verify all media types support watchlist/wishlist/favorites
   - Create helper mutations for adding/removing from lists

5. **Update navigation**:
   - Add "Watchlist" link to main nav (under "My Library")
   - Shows count of unwatched items

6. **Acceptance Criteria**:
   - ✅ All media types have consistent watchlist/favorites features
   - ✅ Terminology is standardized (watchlist/wishlist/favorites)
   - ✅ Detail pages show action buttons to add to lists
   - ✅ Unified watchlist page accessible from nav
   - ✅ Watchlist shows count in nav
   - ✅ Can remove items from watchlist

7. **Files to modify**:
   - `src/app/tv-shows/[id]/page.tsx` - Add watchlist tab
   - `src/app/books/[id]/page.tsx` - Add wishlist/favorites tabs
   - `src/components/tv-show-card.tsx` - Add watchlist button
   - `src/components/book-card.tsx` - Add wishlist button
   - Create: `src/components/watchlist-tabs.tsx` (reusable component)
   - Create: `src/app/watchlist/page.tsx` (unified view)
   - `src/components/navigation.tsx` - Add watchlist to nav

---

## 🟡 PHASE 2: HIGH - UX Improvements & Missing Features

### Task 2.1: Standardize Detail Pages

**Priority**: 🟡 HIGH  
**Impact**: Medium-High (consistency across app)  
**Effort**: Medium (4-5 hours)  
**Status**: ⬜ Not Started
**Dependencies**: Task 1.3 (needs watchlist/favorites first)

**Current Problem**:

- Movie detail pages have one structure
- TV Show detail pages have different structure
- Book detail pages have different layout
- Inconsistent tabs and actions
- Users expect consistency when navigating between media types

**Objective**:
Standardize detail page layout and functionality across all media types.

**Implementation Details**:

1. **Standardize detail page sections** (all media types):

   ```
   [HEADER]
   - Poster/Cover image (left)
   - Title, metadata, rating (right)
   - Action buttons: [Watched/To-Read] [Watchlist] [Favorites] [More]

   [TABS/SECTIONS]
   - Overview (synopsis, metadata, genres, tags)
   - Similar/Recommendations (related movies/books)
   - Details (cast, author, production info)
   - Reviews/Ratings (user notes, rating)
   - History (watch/read history with dates)

   [SIDEBAR - Optional]
   - Key stats
   - External links (TMDB, Goodreads)
   ```

2. **Create reusable components**:
   - `src/components/media-detail-header.tsx` - Header with poster and actions
   - `src/components/media-detail-tabs.tsx` - Tab container
   - `src/components/media-similar-items.tsx` - Related recommendations
   - `src/components/media-review-card.tsx` - User notes/ratings display

3. **Update detail pages**:
   - `src/app/movies/[id]/page.tsx` - Refactor to use new structure
   - `src/app/tv-shows/[id]/page.tsx` - Align with movies structure
   - `src/app/books/[id]/page.tsx` - Align with movies structure
   - Bible books detail page (if applicable)

4. **Add missing features**:
   - Similar recommendations on detail pages
   - Related movies/books (sequels, series, same author)
   - Tag management from detail page
   - Quick stats (e.g., "You watched this X days ago")

5. **Acceptance Criteria**:
   - ✅ All detail pages follow same layout pattern
   - ✅ All media types have same action buttons
   - ✅ Similar/recommendations shown
   - ✅ History/watch timeline visible
   - ✅ Responsive on mobile/tablet/desktop
   - ✅ Consistent tab structure

---

### Task 2.2: Enhance Dashboard with Cross-Media Insights

**Priority**: 🟡 HIGH  
**Impact**: Medium (home experience)  
**Effort**: Medium (4-5 hours)  
**Status**: ⬜ Not Started

**Current Problem**:

- Dashboard only shows recent movie watches
- No recently-added movies/TV/books section
- Quick action only adds movies (not TV or books)
- Doesn't give full picture of user activity
- Stats cards are generic (not media-type specific)

**Objective**:
Make dashboard more informative and actionable for all media types.

**Implementation Details**:

1. **Add new dashboard sections**:
   - "Recently Added" - Last 5 movies/TV shows/books added
   - "Currently Reading" - Books with reading progress (already exists, verify it's prominent)
   - "Currently Watching" - TV shows currently being watched
   - "Quick Stats" - Cards for total movies, TV episodes, books
   - "This Week's Activity" - What user has been consuming

2. **Update stats cards** to show per-media-type insights:
   - Total movies watched this year
   - Total TV episodes this year
   - Total books read this year
   - Hours spent watching vs reading

3. **Add quick action buttons**:
   - "Add Movie", "Add TV Show", "Add Book" (not just movie)
   - Use floating action button or card-based approach
   - Position near top or in sidebar

4. **Create reusable components**:
   - `src/components/recently-added-section.tsx`
   - `src/components/currently-consuming-section.tsx`
   - `src/components/media-stats-cards.tsx` (update existing)

5. **Update**: `src/app/page.tsx`
   - Add new sections with Suspense boundaries
   - Keep existing recent watches section
   - Add "View all" links to each section

6. **Acceptance Criteria**:
   - ✅ Dashboard shows recently-added items from all media types
   - ✅ Currently-consuming items visible (books being read, TV shows watching)
   - ✅ Quick action buttons for all media types
   - ✅ Stats cards show per-media-type breakdowns
   - ✅ All sections have loading states
   - ✅ Responsive on all screen sizes

---

### Task 2.3: Add Mobile Bottom Navigation

**Priority**: 🟡 HIGH  
**Impact**: Medium-High (mobile UX)  
**Effort**: Medium (3-4 hours)  
**Status**: ⬜ Not Started
**Dependencies**: Task 1.1 (needs refactored nav structure)

**Current Problem**:

- Mobile menu is hamburger button (must tap to open)
- Navigation items not persistent on mobile
- No visual indicator of current section
- Not following mobile navigation best practices
- Common media apps use bottom tabs (Netflix, YouTube, etc.)

**Objective**:
Implement persistent mobile bottom navigation with tab bar pattern.

**Implementation Details**:

1. **Create bottom nav component**: `src/components/mobile-bottom-nav.tsx`
   - 5-6 primary action tabs
   - Icons + labels
   - Active state highlighting
   - Consistent with desktop primary nav items

2. **Tab bar structure** (mobile only):

   ```
   [Dashboard] [Media] [My Library] [Lists] [More]
   ```

   - Dashboard: home icon
   - Media: film/tv icon → opens dropdown or goes to media discovery
   - My Library: library icon
   - Lists: list icon
   - More: menu icon → secondary items

3. **Update navigation wrapper**:
   - Show bottom nav on mobile (<768px)
   - Adjust main content padding to account for bottom nav
   - Keep existing mobile menu button (Cmd+K shortcut?)

4. **Design considerations**:
   - Bottom nav should not overlay content
   - Adjust page containers to have `pb-20` or similar
   - Icons should be from lucide-react (consistent)
   - Active state should be clear (color highlight)

5. **Files to create/modify**:
   - Create: `src/components/mobile-bottom-nav.tsx`
   - Modify: `src/app/layout.tsx` - Add bottom nav
   - Modify: All page components - Add padding for bottom nav
   - Modify: `src/components/navigation.tsx` - Conditional rendering

6. **Acceptance Criteria**:
   - ✅ Bottom nav visible on mobile only
   - ✅ 5-6 primary navigation items
   - ✅ Active state clearly indicated
   - ✅ Tabs are clickable and navigate correctly
   - ✅ Icons + labels visible
   - ✅ Content not hidden behind nav
   - ✅ Responsive (not shown on desktop/tablet)

---

### Task 2.4: Add Icon System to Navigation

**Priority**: 🟡 HIGH  
**Impact**: Medium (visual clarity)  
**Effort**: Small (1-2 hours)  
**Status**: ⬜ Not Started
**Dependencies**: Task 1.1

**Current Problem**:

- Desktop nav top items have NO icons (text only)
- Icons exist in dropdowns but not visible in main nav
- Hard to scan navigation quickly
- Inconsistent with mobile which can show icons

**Objective**:
Add consistent icon system to all navigation items for visual clarity and scannability.

**Implementation Details**:

1. **Assign icons** to all nav items (using lucide-react):
   - Dashboard → LayoutDashboard
   - Movies → Film
   - TV Shows → Tv
   - Books → Book
   - Bible → BookOpen
   - Watch History → History
   - Library → Library
   - Watchlist → Bookmark
   - Lists → List
   - Loans → HandHelping
   - Recommendations → ThumbsUp
   - Statistics → BarChart2
   - Settings → Settings

2. **Update navigation components**:
   - `src/components/navigation.tsx` - Add icon property to navigationItems
   - `src/components/desktop-nav-menus.tsx` - Display icons in top nav buttons
   - `src/components/mobile-nav-menu.tsx` - Ensure icons visible in mobile
   - `src/components/mobile-bottom-nav.tsx` - Icons already planned here

3. **Styling**:
   - Icons should be 18-20px on desktop top nav
   - Icons should be visible in both light and dark mode
   - Add icon + label on desktop (show label when space available)
   - Mobile: icon only or icon + label depending on space

4. **Acceptance Criteria**:
   - ✅ All nav items have consistent icons
   - ✅ Icons visible in desktop top nav
   - ✅ Icons work in light and dark mode
   - ✅ Icons are accessible (proper size, contrast)
   - ✅ Icons help with visual scanning

---

### Task 2.5: Enhance Statistics with Cross-Media Analysis

**Priority**: 🟡 HIGH  
**Impact**: Medium (analytics depth)  
**Effort**: Medium-Large (5-6 hours)  
**Status**: ⬜ Not Started

**Current Problem**:

- Statistics page shows individual media type analytics
- No cross-media comparisons (movies vs TV vs books time spent)
- Missing key insights (genre trends, author analysis)
- No reading velocity metrics for books
- No binge analysis for TV shows
- Recommendations logic not explained

**Objective**:
Add cross-media statistics and deeper insights into consumption patterns.

**Implementation Details**:

1. **Add new statistics sections**:
   - "Media Time Breakdown" - Pie chart: Hours watching movies vs TV vs reading books
   - "This Year vs Last Year" - Comparative view
   - "Top Genres" - Across all media types
   - "Most Watched/Read Authors/Directors"
   - "Reading Velocity" - Pages per week for books
   - "Binge Analysis" - How many episodes watched per session for TV
   - "Consistency Score" - Streak tracking for reading/watching

2. **Create reusable chart components**:
   - `src/components/media-time-breakdown-chart.tsx`
   - `src/components/genre-trends-chart.tsx`
   - `src/components/author-director-chart.tsx`
   - `src/components/reading-velocity-chart.tsx`

3. **Add filters** to statistics:
   - Year selector (already exists for movies, extend to all)
   - Media type filter (show only movie stats, or TV stats)
   - Genre filter
   - Date range selector

4. **Create statistics routers** (if missing):
   - Endpoint for cross-media time breakdown
   - Endpoint for top genres across all media
   - Endpoint for author/director stats
   - Endpoint for reading/watching velocity

5. **Update**: `src/app/statistics/page.tsx`
   - Add new sections with Suspense boundaries
   - Organize existing sections logically
   - Add tabs for different views (Overview, Detailed, Trends)

6. **Acceptance Criteria**:
   - ✅ Cross-media time breakdown visible
   - ✅ Genre trends shown across media types
   - ✅ Reading velocity calculated and displayed
   - ✅ Binge analysis available for TV
   - ✅ Author/director top performers shown
   - ✅ Year filter works for all charts
   - ✅ Responsive and performs well

---

## 🟢 PHASE 3: MEDIUM - Polish & Enhancements

### Task 3.1: Standardize Empty States & Loading States

**Priority**: 🟢 MEDIUM  
**Impact**: Medium (UX polish)  
**Effort**: Small-Medium (2-3 hours)  
**Status**: ⬜ Not Started

**Current Problem**:

- Inconsistent loading state styles
- No clear empty state messaging
- Some sections show skeleton, some show nothing
- Users unsure if page is loading or empty

**Objective**:
Create consistent, reusable empty state and loading state components.

**Implementation Details**:

1. **Create empty state component**: `src/components/empty-state.tsx`
   - Icon
   - Title
   - Description
   - Call-to-action button
   - Configurable for different scenarios

2. **Create loading state component**: `src/components/content-loader.tsx`
   - Skeleton matching content shape
   - Pulsing animation (already used, verify consistency)
   - Loading text
   - Estimated time (optional)

3. **Audit all pages**:
   - Movies page - no results for search?
   - TV Shows page - no results?
   - Books page - no books added?
   - Watchlist pages - empty?
   - Collection - no loans?
   - etc.

4. **Create empty state for each**:
   - "No movies found" with search tips
   - "No books added yet" with add button
   - "Empty watchlist" with discover button
   - "No loans" with info about loans
   - etc.

5. **Acceptance Criteria**:
   - ✅ All pages with potential empty state have messaging
   - ✅ Loading states are consistent
   - ✅ Empty state components are reusable
   - ✅ Call-to-action clear (what should user do next?)

---

### Task 3.2: Add Quick Filters to List Pages

**Priority**: 🟢 MEDIUM  
**Impact**: Medium (discoverability)  
**Effort**: Small-Medium (2-3 hours)  
**Status**: ⬜ Not Started

**Current Problem**:

- Advanced filters are powerful but complex
- No quick filters for common views ("This Year", "Unwatched", "Highly Rated")
- Users must use advanced filters for simple queries
- Mobile filtering is difficult

**Objective**:
Add preset quick filters for common queries.

**Implementation Details**:

1. **Add quick filter pills/buttons** above results:
   - For Movies: "Unwatched", "This Year", "Favorites", "Highly Rated (8+)", "Recently Added"
   - For TV: Similar filters
   - For Books: "Not Started", "Reading", "Finished", "Favorites", "This Year"

2. **Implement quick filters**:
   - Click pill to apply filter
   - Visual indication of active filters
   - Can combine multiple quick filters
   - "Clear All" button when filters applied

3. **Create component**: `src/components/quick-filters.tsx`
   - Configurable filter options per page
   - Click handler to update search params
   - Active state styling

4. **Update pages**:
   - `src/app/movies/page.tsx` - Add quick filters
   - `src/app/tv-shows/page.tsx` - Add quick filters
   - `src/app/books/page.tsx` - Add quick filters
   - `src/app/watches/page.tsx` - Add quick filters

5. **Acceptance Criteria**:
   - ✅ Quick filters visible above results
   - ✅ Clicking filter applies it
   - ✅ Can combine multiple filters
   - ✅ Active filters clearly indicated
   - ✅ Mobile-friendly (horizontal scroll if needed)

---

### Task 3.3: Improve Settings/Preferences Page

**Priority**: 🟢 MEDIUM  
**Impact**: Low-Medium (personalization)  
**Effort**: Medium (3-4 hours)  
**Status**: ⬜ Not Started

**Current Problem**:

- Settings page exists but is minimal
- No viewing preferences (favorite genres, etc.)
- No notification settings
- No default filter preferences
- User preferences not well surfaced

**Objective**:
Expand settings to include personalization and preferences.

**Implementation Details**:

1. **Audit existing settings** in `src/components/settings-content.tsx`:
   - Theme (light/dark/system) ✓
   - Tag management ✓
   - Data export ✓
   - Jellyfin webhook settings ✓

2. **Add new settings sections**:
   - **Viewing Preferences**: Favorite genres, languages, watched status defaults
   - **Default Filters**: Save sort order, default filters for each page
   - **Notifications**: Email/push notifications for recommendations
   - **Display**: Cards per page, default view (grid/list)
   - **Privacy**: Data sharing settings
   - **Integrations**: TMDB settings, Jellyfin settings (already exists)

3. **Create user preferences schema** (if not exists):
   - Extend existing user preferences
   - Store favorite genres, default sort, etc.

4. **Update preferences API**:
   - Create/update mutation for user preferences
   - Fetch preferences on app load
   - Use preferences across pages

5. **Update Settings page layout**:
   - Use tabs or accordion for sections
   - Group related settings
   - Add descriptions for each setting

6. **Acceptance Criteria**:
   - ✅ Settings organized in clear sections
   - ✅ Can set favorite genres
   - ✅ Can set default sort order
   - ✅ Preferences apply across app
   - ✅ Changes persist
   - ✅ Settings properly documented

---

### Task 3.4: Add Keyboard Shortcuts & Accessibility

**Priority**: 🟢 MEDIUM  
**Impact**: Medium (power users + accessibility)  
**Effort**: Medium (3-4 hours)  
**Status**: ⬜ Not Started

**Current Problem**:

- No keyboard shortcuts documented
- No visual hints for keyboard navigation
- Search opens with icon only (no Cmd+K shortcut)
- No accessibility improvements for navigation

**Objective**:
Add keyboard shortcuts and improve accessibility across navigation and key features.

**Implementation Details**:

1. **Define keyboard shortcuts**:
   - Cmd+K / Ctrl+K: Open search
   - "/" : Open search (alternative)
   - "M" : Go to Movies
   - "T" : Go to TV Shows
   - "B" : Go to Books
   - "D" : Go to Dashboard
   - "W" : Go to Watchlist
   - "S" : Go to Statistics
   - "?" : Show shortcuts help

2. **Create shortcuts help modal**: `src/components/keyboard-shortcuts-help.tsx`
   - Display all available shortcuts
   - Open with "?"
   - Modal showing categorized shortcuts
   - Keyboard-friendly interface

3. **Implement shortcuts handler**:
   - Create hook: `src/hooks/use-keyboard-shortcuts.ts`
   - Use keyboard event listener
   - Debounce to prevent multiple triggers
   - Don't trigger in input fields

4. **Improve accessibility**:
   - Verify all buttons have aria-labels
   - Verify navigation items have role attributes
   - Add skip-to-content link (already exists, verify works)
   - Test with keyboard navigation (Tab, Enter)
   - Verify screen reader announcements

5. **Add visual hints**:
   - Show shortcut hints in tooltips on hover
   - Add "?" icon in header linking to shortcuts
   - Add shortcuts legend in settings

6. **Acceptance Criteria**:
   - ✅ Keyboard shortcuts implemented and working
   - ✅ Shortcuts accessible from any page
   - ✅ Help dialog shows all shortcuts
   - ✅ Full keyboard navigation possible
   - ✅ ARIA labels on interactive elements
   - ✅ Passes accessibility audit (WAVE/Axe)

---

## 🔵 PHASE 4: NICE-TO-HAVE - Future Enhancements

### Task 4.1: Add Recommendations Explanation

**Priority**: 🔵 LOW  
**Impact**: Low (nice-to-have)  
**Effort**: Small (1-2 hours)  
**Status**: ⬜ Not Started

**Description**:

- Explain how recommendations are generated on recommendations page
- Show "Why recommended" for each item
- Allow filtering recommendations by reason (same genre, top-rated, director, actor, etc.)
- Add trust indicator (confidence score)

**Files**:

- `src/app/recommendations/page.tsx`
- `src/components/recommendations-content.tsx`

---

### Task 4.2: Add Series/Franchise Grouping

**Priority**: 🔵 LOW  
**Impact**: Low (nice-to-have)  
**Effort**: Large (8-10 hours)  
**Status**: ⬜ Not Started

**Description**:

- Group movies by franchise/series
- Group books by series
- Group TV shows by franchise
- Show series progress
- One-click add all in series to watchlist

**Database changes needed**: Add series/franchise linking to Prisma schema

---

### Task 4.3: Add Social/Sharing Features

**Priority**: 🔵 LOW  
**Impact**: Low (nice-to-have)  
**Effort**: Large (10+ hours)  
**Status**: ⬜ Not Started

**Description**:

- Share lists publicly
- Share watch/read history (with privacy controls)
- Share recommendations
- Generate shareable links
- Maybe simple social feed for friends

---

### Task 4.4: Add Collaborative Lists

**Priority**: 🔵 LOW  
**Impact**: Low (nice-to-have)  
**Effort**: Large (10+ hours)  
**Status**: ⬜ Not Started

**Description**:

- Invite others to lists
- Collaborative watching/reading
- Comments on list items
- Voting on list items

---

## 📋 Implementation Order & Dependencies

### Recommended Execution Path

```
Phase 1 (CRITICAL) - Do these first, in order:
├─ Task 1.1: Navigation Refactor
├─ Task 1.2: Unified Search (depends on 1.1)
└─ Task 1.3: Consolidate Watchlists (depends on 1.1)

Phase 2 (HIGH) - Parallel work possible:
├─ Task 2.1: Standardize Detail Pages (depends on 1.3)
├─ Task 2.2: Enhance Dashboard (independent)
├─ Task 2.3: Mobile Bottom Nav (depends on 1.1)
├─ Task 2.4: Icon System (depends on 1.1)
└─ Task 2.5: Enhanced Statistics (independent)

Phase 3 (MEDIUM) - Polish:
├─ Task 3.1: Empty/Loading States (independent)
├─ Task 3.2: Quick Filters (independent)
├─ Task 3.3: Improve Settings (independent)
└─ Task 3.4: Keyboard Shortcuts (independent)

Phase 4 (FUTURE) - Nice-to-haves:
├─ Task 4.1: Recommendations Explanation
├─ Task 4.2: Series Grouping
├─ Task 4.3: Social Features
└─ Task 4.4: Collaborative Lists
```

---

## 🧪 Testing Checklist

For each completed task:

- [ ] Desktop browser (Chrome, Firefox, Safari)
- [ ] Mobile browser (iOS Safari, Chrome Android)
- [ ] Tablet (iPad, Android tablet)
- [ ] Dark mode
- [ ] All routes accessible
- [ ] No console errors
- [ ] No console warnings
- [ ] Accessibility audit (WAVE or Axe)
- [ ] Performance check (Lighthouse)
- [ ] Database consistency
- [ ] Edge cases tested

---

## 📊 Success Metrics

### Navigation Refactor (Task 1.1)

- ✅ Time-to-navigate to any page < 2 clicks from home
- ✅ User can explain nav structure without instruction
- ✅ No change in bounce rate

### Unified Search (Task 1.2)

- ✅ 80%+ users use search within first week
- ✅ Average search result time < 200ms
- ✅ Cmd+K keyboard shortcut discovered by power users

### Detail Page Standardization (Task 2.1)

- ✅ Consistent experience across all media types
- ✅ < 1 sec load time for detail pages
- ✅ Users don't get lost navigating between media types

### Mobile Bottom Nav (Task 2.3)

- ✅ Mobile navigation more discoverable
- ✅ Decrease in "menu not found" friction
- ✅ Increase in feature usage on mobile

---

## 🤝 Notes for AI Agents

When working through these tasks:

1. **Read file references first** before implementing
2. **Check existing components** before creating new ones (DRY principle)
3. **Test each task independently** before moving to next
4. **Update related files** when making changes (e.g., types, exports)
5. **Follow project conventions** (TypeScript strict mode, component structure, naming)
6. **Reference the copilot-instructions.md** for best practices
7. **Create reusable components** when similar patterns emerge
8. **Keep components under 150 lines** (split if larger)
9. **Use server components** by default, client only when needed
10. **Invalidate queries** when mutations affect data

---

## 📝 Completed Tasks

(Update this section as tasks are completed)

- [x] Task 1.1: Navigation Refactor
- [x] Task 1.2: Unified Search
- [x] Task 1.3: Consolidate Watchlists
- [ ] Task 2.1: Standardize Detail Pages
- [ ] Task 2.2: Enhance Dashboard
- [ ] Task 2.3: Mobile Bottom Nav
- [ ] Task 2.4: Icon System
- [ ] Task 2.5: Enhanced Statistics
- [ ] Task 3.1: Empty/Loading States
- [ ] Task 3.2: Quick Filters
- [ ] Task 3.3: Improve Settings
- [ ] Task 3.4: Keyboard Shortcuts
- [ ] Task 4.1: Recommendations Explanation
- [ ] Task 4.2: Series Grouping
- [ ] Task 4.3: Social Features
- [ ] Task 4.4: Collaborative Lists

---

**Last Updated**: February 6, 2026  
**Next Review**: After Phase 1 completion
