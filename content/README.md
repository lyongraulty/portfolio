## Content workflow

This folder is the handoff point between your asset storage and the website.

The goal is simple:

- Bunny stores the actual media files.
- Google Sheets stores editable copy, ordering, and variables.
- `content/bunny-media.json` maps Bunny files to rendering roles.
- `content/projects.json` is the merged project manifest the site reads.
- `content/pages.generated.json` is a generated page payload for richer project page rendering.

## Recommended Bunny structure

Use one folder per project with predictable file names.

```text
/projects
  /sellout-film-title-sequence
    cover.png
    reel.mp4
    still-01.png
    still-02.png
  /drumwave
    cover.mp4
    still-01.png
  /reebok-sustainability
    cover.mp4
```

## Manifest rules

In `content/projects.json`:

- `slug` should match the Bunny folder name.
- `media.src` can be:
  - a full URL, or
  - a relative path like `projects/drumwave/cover.mp4`
- If `media.src` is relative, the app prefixes it with `BUNNY_MEDIA_BASE_URL`.

Example:

```json
{
  "slug": "drumwave",
  "title": "DRUMWAVE",
  "media": {
    "type": "video",
    "src": "projects/drumwave/cover.mp4"
  }
}
```

## Practical workflow

1. Export or mirror files into Bunny using the project folder naming above.
2. Describe each asset's role in `content/bunny-media.json`.
3. Keep copy, order, category, and variables in Google Sheets.
4. Run `npm run sync:projects`.
5. The script fetches sheet data, merges it with Bunny mappings, and rewrites:
   - `content/projects.json`
   - `content/pages.generated.json`
6. Point `BUNNY_MEDIA_BASE_URL` at your Bunny pull zone or storage hostname if you use relative asset paths.
7. The app will use `GOOGLE_SCRIPT_URL` when available and fall back to `content/pages.generated.json` locally.

## Bunny mapping file

Create `content/bunny-media.json` by copying `content/bunny-media.example.json`.

This file is the bridge between folders and rendering intent:

- `slug` matches the sheet row and project folder
- `media.card` is the preview asset for the project grid
- `media.blocks` defines the project detail page media and layout

This keeps "where the file lives" separate from "how the site should use it."

## Sheet requirements

Your sheet payload should expose `pages` or `projects` rows with keys such as:

- `slug` or `project slug`
- `page`
- `title`
- `year`
- `category`
- `summary` or `project copy`
- `detail` or `project detail`
- `button text`

If a field is missing, the sync script falls back to Bunny data where it can.

## Why this helps

- One place to organize project metadata
- Bunny paths become predictable instead of ad hoc
- Sheets stays the easy editing surface for copy and variables
- The generated JSON becomes the clean contract your site renders
