# Copilot Instructions

## Package Manager

pnpm
## Technologies used

T3 Stack with typescript
zod for schema validation
react-hook-form for form validation
trpc for backend communication
Shadcn UI for frontend

## Best practises

- use zod for schema validation
- use trpc for backend communication
- use react-hook-form for form validation
- use pnpm for package manager
- everything should be 100% typesafe and striclty typed
- server side rendering using actionState, transitions and suspense boundaries should ALWAYS be preferred over client side rendering
  - when a client side component is needed, it should just be the component it self - not the whole page or the bigger component
  - when building components, try to make them reusable and not depend on the context of the page
- make sure to invalidate react query hooks AND the server rendered routes when editing/deleting data
- screens (like detail or edit pages) should always have their own route so the link to them can be copied
- Use the RouterOutputs type from trpc for types in components - don't re-define types in components or helper functions!
- Keep files around 150 lines of code, they can be a little more or a little less but try to maintain components or files of this size to improve code readability
- Use compound component pattern for file structures or components composed of more than one section
- Move all fetching logic or information processing to a hook, components should only display the view and catch events, hooks process that information, if necessary create custom hooks and share them with other components
- Keep page.tsx as server side components always, components within page.tsx can be "client side" (for NextJS)
- If you create a service with pagination use skip and limit keywords for paging
- NextJS routes with a GET method implemented by id should be created in a nested directory called [id] and inside create a route.ts. If the get is not a get by id and it return a list of elements it always should implement pagination
- Don’t use javascript to validate screen sizes, use media queries and css.
- I need every time you change the logic or the content of a component let’s rename the component and the file in order to give relevant context to the user when he user reads the file name
- Every time you change a file or a component see if it neccesary or if you can do a refactor to split responsibility an create other reusable components, if you see that’s possible do it.
- Parameterize font styles and branding colors to use each color as —primary, —secondary, -tertiary and so on.. in case of font styles use a style for headings and another for paragraphs and small sizesm
- Move (if possibe) data fetching to suspense boundaries and refrain from using client side useQuery or useEffect to fetch data
- DON'T just create a xxx-client.tsx component - only components which NEED to be client components should be client components - prefer server side rendering with suspense boundaries, actionState and transitions

## Hints

- user logged in handling is already being handled by the middleware

## Shadcn UI

components can be installed by using:

```
pnpm dlx shadcn-ui@latest add ...
```
