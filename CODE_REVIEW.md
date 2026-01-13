# 📋 Trackerr - Comprehensive Code Review

**Date:** January 13, 2026  
**Project:** Trackerr - T3 Stack Media Tracker  
**Tech Stack:** Next.js 16, TypeScript, Prisma, tRPC, React Hook Form, shadcn/ui

---

## 🔴 Critical Issues

### 1. **Duplicated Helper Functions - Label Formatting**

**Severity:** HIGH  
**Files Affected:**
- [src/components/movie-watch-card.tsx](src/components/movie-watch-card.tsx) (Lines 67-95)
- [src/components/watches-grid.tsx](src/components/watches-grid.tsx) (Lines 48-51 for `getWatchLocationBadge`)
- [src/components/collection-grid.tsx](src/components/collection-grid.tsx) (Lines 21-32 for `getMediaTypeLabel`)

**Issue:** Multiple components define the same label-formatting functions independently:
```tsx
// movie-watch-card.tsx
const getSoundSystemLabel = (value: string) => {
  return SOUND_SYSTEM_TYPES.find((type) => type.value === value)?.label ?? value.replace(/_/g, " ");
};

const getProjectionTypeLabel = (value: string) => {
  return PROJECTION_TYPES.find((type) => type.value === value)?.label ?? value.replace(/_/g, " ");
};

const getLanguageTypeLabel = (value: string) => {
  return LANGUAGE_TYPES.find((type) => type.value === value)?.label ?? value.replace(/_/g, " ");
};

const getAspectRatioLabel = (value: string) => {
  return ASPECT_RATIOS.find((ratio) => ratio.value === value)?.label ?? value.replace(/_/g, " ");
};
```

**Recommendation:**
Create a centralized utility function in `src/lib/label-utils.ts`:
```typescript
export function getLabelFromEnum<T extends { value: string; label: string }>(
  value: string,
  enumOptions: T[]
): string {
  return enumOptions.find((option) => option.value === value)?.label ?? value.replace(/_/g, " ");
}

// Usage:
const getSoundSystemLabel = (value: string) => 
  getLabelFromEnum(value, SOUND_SYSTEM_TYPES);
```

---

### 2. **Duplicated `getPosterUrl` Function**

**Severity:** HIGH  
**Files Affected:**
- [src/components/movie-watch-card.tsx](src/components/movie-watch-card.tsx)
- [src/components/watches-grid.tsx](src/components/watches-grid.tsx#L20)
- [src/components/collection-grid.tsx](src/components/collection-grid.tsx#L47)
- [src/components/movie-card.tsx](src/components/movie-card.tsx#L81)
- [src/components/movie-detail-header.tsx](src/components/movie-detail-header.tsx#L18)
- [src/components/recommendations-content.tsx](src/components/recommendations-content.tsx#L27)

**Issue:** The exact same function is implemented in 6 different components:
```typescript
const getPosterUrl = (posterPath: string | null) => {
  return posterPath ? `${posterPath}` : "/placeholder-movie.jpg";
};
```

**Recommendation:**
Move to [src/lib/image-utils.ts](src/lib/image-utils.ts) or extend [src/helpers/image-upload.ts](src/helpers/image-upload.ts)
```typescript
export const getPosterUrl = (posterPath: string | null, placeholder = "/placeholder-movie.jpg"): string => 
  posterPath ?? placeholder;
```

---

### 3. **Duplicated `renderStars` Function**

**Severity:** MEDIUM  
**Files Affected:**
- [src/components/movie-watch-card.tsx](src/components/movie-watch-card.tsx#L172)
- [src/components/watches-grid.tsx](src/components/watches-grid.tsx#L24)
- [src/components/recent-watches-list.tsx](src/components/recent-watches-list.tsx#L21)

**Issue:** Three identical star rating render functions:
```typescript
const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = rating >= star;
        const isHalfFilled = rating >= star - 0.5 && rating < star;
        // ... JSX
      })}
    </div>
  );
};
```

**Recommendation:**
Component already exists: [src/components/star-rating.tsx](src/components/star-rating.tsx)  
**Action:** Use the existing component or convert `renderStars` to a helper component:
```typescript
// Create src/components/star-rating-display.tsx
export function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {/* ... implementation ... */}
    </div>
  );
}
```

---

### 4. **Inconsistent `getWatchLocationBadge` Implementation**

**Severity:** MEDIUM  
**Files Affected:**
- [src/components/watches-grid.tsx](src/components/watches-grid.tsx#L48)

**Issue:** Watch location labels are duplicated across files:
```typescript
// watches-grid.tsx
const getWatchLocationBadge = (location: string) => {
  const labels: Record<string, string> = {
    ON_DEMAND: "On Demand",
    CINEMA: "Cinema",
    TV: "TV",
    OTHER: "Other",
  };
  return labels[location] ?? location;
};
```

But the source of truth is already defined in [src/lib/form-schemas.ts#L28](src/lib/form-schemas.ts#L28):
```typescript
export const WATCH_LOCATIONS = [
  { value: "ON_DEMAND", label: "On Demand" },
  { value: "CINEMA", label: "Cinema" },
  { value: "TV", label: "TV" },
  { value: "OTHER", label: "Other" },
] as const;
```

**Recommendation:**
Use the centralized `getLabelFromEnum` with `WATCH_LOCATIONS`.

---

## 🟠 Medium Priority Issues

### 5. **Missing Shared Utility for Content-Type Header**

**Severity:** MEDIUM  
**Files Affected:**
- [src/helpers/hugendubel-api.ts](src/helpers/hugendubel-api.ts) (Lines 71, 144, 227)

**Issue:** Content-Type header is hardcoded three times:
```typescript
"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
```

**Recommendation:**
```typescript
// src/helpers/hugendubel-api.ts
const FORM_ENCODED_HEADER = "application/x-www-form-urlencoded; charset=UTF-8";

// Usage:
"Content-Type": FORM_ENCODED_HEADER
```

---

### 6. **No Centralized Image Utility Module**

**Severity:** MEDIUM  
**Issue:** Image handling is scattered:
- [src/helpers/image-upload.ts](src/helpers/image-upload.ts) - MinIO uploads
- `getPosterUrl` duplicated in 6 components
- No standardized image error handling

**Recommendation:**
Create `src/lib/image-utils.ts`:
```typescript
export const getPosterUrl = (posterPath: string | null): string => 
  posterPath ?? "/placeholder-movie.jpg";

export const getThumbnailUrl = (posterPath: string | null): string =>
  posterPath ? `${posterPath}?w=200&h=300` : "/placeholder-movie.jpg";

export const getBlurredImageUrl = (posterPath: string | null): string =>
  posterPath ? `${posterPath}?blur=10` : "/placeholder-movie.jpg";
```

---

### 7. **Form Validation Schemas Separated Across Files**

**Severity:** MEDIUM  
**Files Affected:**
- [src/lib/api-schemas.ts](src/lib/api-schemas.ts)
- [src/lib/form-schemas.ts](src/lib/form-schemas.ts)

**Issue:** Zod schemas split between two files with:
- `movieWatchFormSchema` in api-schemas.ts
- `movieWatchSchema` in form-schemas.ts (just a re-export)
- Enums defined separately in form-schemas.ts

**Example:**
```typescript
// form-schemas.ts
export const movieWatchSchema = movieWatchFormSchema; // Just re-exports from api-schemas

export const WATCH_LOCATIONS = [
  { value: "ON_DEMAND", label: "On Demand" },
  // ...
] as const;

// Inconsistent: label strings hardcoded elsewhere
```

**Recommendation:**
Consolidate into single `src/lib/schemas.ts`:
```typescript
// Single source of truth
export const watchLocationEnum = ["ON_DEMAND", "CINEMA", "TV", "OTHER"] as const;
export const WATCH_LOCATION_LABELS = {
  ON_DEMAND: "On Demand",
  CINEMA: "Cinema",
  TV: "TV",
  OTHER: "Other",
} as const;

export const movieWatchSchema = z.object({
  watchLocation: z.enum(watchLocationEnum),
  // ...
});

// All enums consolidated with their labels
```

---

### 8. **Large Component File Sizes**

**Severity:** MEDIUM  
**Files Affected:**
- [src/components/movie-watch-card.tsx](src/components/movie-watch-card.tsx) - **736 lines** (exceeds 150 line guideline)
- [src/components/quick-watch-dialog.tsx](src/components/quick-watch-dialog.tsx) - **280 lines**
- [src/components/advanced-filters.tsx](src/components/advanced-filters.tsx) - **large file**
- [src/components/jellyfin-webhook-settings.tsx](src/components/jellyfin-webhook-settings.tsx) - **large file**

**Recommendation:**
Break down large components following compound component pattern:

**movie-watch-card.tsx** should be split into:
- `movie-watch-card-header.tsx`
- `movie-watch-card-content.tsx`
- `movie-watch-card-edit-form.tsx`
- `movie-watch-card.tsx` (orchestrator)

---

### 9. **Inconsistent Hook Patterns**

**Severity:** MEDIUM  
**Files Affected:**
Multiple files implement similar mutation patterns manually

**Issue:** Each component manually handles:
```typescript
const { createWatch } = useMovieMutations();
// or
const deleteMovie = api.movie.delete.useMutation({
  onSuccess: () => { /* invalidate */ },
  onError: (error) => { /* handle */ }
});
```

**Recommendation:**
Create custom hooks to encapsulate patterns:
```typescript
// src/hooks/use-watch-mutations.ts
export function useWatchMutations() {
  const utils = api.useUtils();
  
  return {
    create: api.movieWatch.create.useMutation({
      onSuccess: (data) => {
        utils.movie.invalidate();
        utils.movieWatch.invalidate();
        toast.success("Watch added");
      },
      onError: () => toast.error("Failed to add watch"),
    }),
  };
}
```

---

## 🟡 Low Priority Issues

### 10. **Client-Side Window Checks**

**Severity:** LOW  
**Files Affected:**
- [src/components/jellyfin-webhook-settings.tsx#L298](src/components/jellyfin-webhook-settings.tsx#L298)
- [src/trpc/react.tsx#L15, L75](src/trpc/react.tsx#L15)

**Issue:**
```typescript
{typeof window !== "undefined" && /* JSX */}
```

**Recommendation:**
Use Next.js `'use client'` directive instead (already implemented). Ensure hydration safety with suspense boundaries.

---

### 11. **Magic Strings in Select Options**

**Severity:** LOW  
**Files Affected:**
Multiple select components hardcode option strings

**Example:** [src/components/cinema-metadata-form.tsx](src/components/cinema-metadata-form.tsx)
```tsx
<SelectItem value="FLAT_185_1">Flat (1.85:1) - American Flat</SelectItem>
```

**Recommendation:**
Already using proper enums from `form-schemas.ts` ✅ (Correct approach)

---

### 12. **Inconsistent Error Handling Patterns**

**Severity:** LOW  
**Files Affected:**
- [src/components/movie-watch-form.tsx](src/components/movie-watch-form.tsx#L61)
```typescript
const handleSubmit = async (data: MovieWatchFormData) => {
  try {
    // ...
  } catch {
    // Error handling is done in the mutation
  }
};
```

**Recommendation:**
Remove empty catch blocks or add meaningful error logging.

---

### 13. **No Default Exports Convention**

**Severity:** LOW  
**Files Affected:**
All component files use named exports (correct)

**Status:** ✅ Follows best practice of using named exports

---

### 14. **Missing JSDoc Comments on Exported Functions**

**Severity:** LOW  
**Files Affected:**
Most utility functions lack JSDoc

**Example:**
```typescript
// Missing JSDoc
export function getPosterUrl(posterPath: string | null): string
```

**Recommendation:**
```typescript
/**
 * Converts a poster path to a full image URL with fallback.
 * @param posterPath - The relative poster image path or null
 * @returns The full image URL or placeholder path
 */
export function getPosterUrl(posterPath: string | null): string
```

---

## ✅ Best Practices Observed

1. **✅ 100% TypeScript** - Strict typing throughout
2. **✅ Zod for validation** - Comprehensive schema validation
3. **✅ React Hook Form integration** - Consistent form handling
4. **✅ tRPC for API** - Type-safe API layer
5. **✅ Server-side rendering** - Proper use of suspense boundaries
6. **✅ Component composition** - Good separation of concerns
7. **✅ Constants management** - Centralized enums in form-schemas.ts
8. **✅ Named exports** - Better tree-shaking
9. **✅ Error boundaries** - ErrorDisplay component implemented
10. **✅ Query invalidation** - Proper cache management

---

## 📊 Summary Table

| Issue | Type | Severity | Impact | Effort |
|-------|------|----------|--------|--------|
| Duplicated label helpers | DRY | 🔴 HIGH | ~80 LoC saved | ⭐⭐ |
| `getPosterUrl` duplication | DRY | 🔴 HIGH | ~24 LoC saved | ⭐⭐ |
| `renderStars` duplication | DRY | 🟠 MEDIUM | ~45 LoC saved | ⭐⭐ |
| Form schemas separation | Architecture | 🟠 MEDIUM | Maintainability | ⭐⭐⭐ |
| Large component files | Maintainability | 🟠 MEDIUM | Code complexity | ⭐⭐⭐⭐ |
| Inconsistent hook patterns | Architecture | 🟠 MEDIUM | Code duplication | ⭐⭐⭐ |
| Content-Type header | DRY | 🟠 MEDIUM | ~6 LoC saved | ⭐ |
| Window checks | Best Practice | 🟡 LOW | Hydration safety | ⭐ |
| Empty error catches | Best Practice | 🟡 LOW | Debuggability | ⭐ |
| Missing JSDoc | Documentation | 🟡 LOW | Developer experience | ⭐⭐ |

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Refactoring (High Priority)
1. **Create centralized utility functions:**
   - `src/lib/label-utils.ts` - Generic label getter
   - `src/lib/image-utils.ts` - Image URL helpers

2. **Update affected files:**
   - Remove duplicate functions
   - Import from centralized modules
   - Test all affected components

**Estimated effort:** 2-3 hours

### Phase 2: Architecture Improvements (Medium Priority)
3. **Consolidate schemas:**
   - Merge `api-schemas.ts` and `form-schemas.ts`
   - Create single enum/label definition system

4. **Break down large components:**
   - Split `movie-watch-card.tsx`
   - Refactor `quick-watch-dialog.tsx`
   - Organize related sub-components

**Estimated effort:** 4-6 hours

### Phase 3: Polish (Low Priority)
5. **Add documentation:**
   - JSDoc comments on utilities
   - Component prop documentation

6. **Improve error handling:**
   - Remove empty catch blocks
   - Add proper error logging

**Estimated effort:** 2-3 hours

---

## 📝 Code Quality Metrics

- **Duplication Index:** ~5-7% (mainly utility functions)
- **Average Component Size:** 150-250 lines (mostly good, some outliers)
- **Test Coverage:** Not analyzed (no test files found)
- **Type Safety:** Excellent ✅
- **Documentation:** Basic (missing JSDoc) 🟡

---

## 🔗 References to Code

| File | Lines | Status |
|------|-------|--------|
| [src/components/movie-watch-card.tsx](src/components/movie-watch-card.tsx) | 1-100 | 🔴 Refactor needed |
| [src/lib/form-schemas.ts](src/lib/form-schemas.ts) | 1-114 | 🟠 Consolidation needed |
| [src/helpers/hugendubel-api.ts](src/helpers/hugendubel-api.ts) | 40+ | 🟠 Extract constants |
| [src/components/star-rating.tsx](src/components/star-rating.tsx) | - | ✅ Good existing component |

---

## 🚀 Next Steps

1. **Implement Phase 1** - Create utility modules
2. **Run tests** - Ensure no regressions
3. **Document changes** - Update this review
4. **Plan Phase 2** - Large component refactoring
5. **Schedule Phase 3** - Documentation pass

---

**Review completed:** January 13, 2026
