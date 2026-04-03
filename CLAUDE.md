# DBlocks Code Pro

WordPress block plugin providing Monaco-powered code editing and syntax highlighting.

## Build & Dev

```bash
npm run build    # Builds everything: block, admin, footer-editor + copies Monaco vendor
npm run start    # Dev mode with watch
```

Single webpack config (`webpack.config.js`) handles all entry points and Monaco vendor copy via CopyWebpackPlugin. No separate build steps needed.

## Architecture

### Two Block Variations (one block: `dblocks/codepro`)

**Advanced Custom HTML** (`syntaxHighlight=false`)
- Monaco editor loads in admin footer for HTML editing
- Supports split/preview view modes
- Content renders as raw HTML on frontend
- `useWrapper` option wraps output in a div

**Syntax Highlighter** (`syntaxHighlight=true, scaleHeightWithContent=true`)
- Monaco editor inline for code editing
- Frontend uses highlight.js for syntax coloring
- Copy button + language label in header
- Languages: HTML, CSS, SCSS, JS, JSON, PHP, TypeScript, Bash, Twig, YAML, Plaintext

### Variation detection logic (`src/block/constants/variations.js`)
```
syntaxHighlight === true && scaleHeightWithContent === true → SYNTAX_HIGHLIGHTER
everything else → ADVANCED_CUSTOM_HTML
```

## Key Data Flow

1. User inserts Code Pro block → defaults to Advanced Custom HTML, split mode
2. Footer editor detects selection → loads Monaco into **Gutenberg iframe** (not main page)
3. User types → `onDidChangeModelContent()` → debounced `updateBlockAttributes({ content })`
4. Frontend: render.php checks `syntaxHighlight` → either raw HTML or `<pre><code>` with highlight.js

## File Structure

### PHP (`inc/`)
| File | Class | Purpose |
|------|-------|---------|
| `api.php` | `DBlocksCodePro_API` | Enqueues Monaco config (iframe-only) |
| `block-editor.php` | `DBlocksCodePro_Block_Editor` | Block registration, settings localization |
| `category.php` | `DBlocksCodePro_Category` | Registers "DBlocks" block category |
| `footer-editor.php` | `DBlocksCodePro_Footer_Editor` | Footer Monaco container + React app |
| `gutenberg-utils.php` | `DBlocksCodePro_Gutenberg_Utils` | Editor detection (post.php/post-new.php) |
| `highlight.php` | (functions) | highlight.js asset registration & enqueue |
| `rest-api.php` | `DBlocksCodePro_REST_API` | `/dblocks-codepro/v1/settings` endpoint |
| `settings.php` | `DBlocksCodePro_Admin_Settings` | Admin settings page, option storage |

All PHP files auto-loaded via glob in `dblocks-codepro.php`.

### JavaScript (`src/`)
| File | Purpose |
|------|---------|
| `block/edit.js` | Main edit component, variation routing |
| `block/variations/advanced-custom-html.js` | RawHTML preview component |
| `block/variations/syntax-highlighter.js` | Monaco editor with instance caching |
| `block/render.php` | Frontend PHP rendering |
| `block/view.js` | Frontend: highlight.js init, copy button |
| `block/components/BlockControls.js` | Toolbar: view mode toggle, language selector |
| `block/components/InspectorControls.js` | Sidebar: height, wrapper, settings link |
| `footer-editor/index.js` | React footer Monaco editor for Advanced HTML |
| `admin/index.js` | React settings page app |
| `global/utils/settings.js` | `DBlocksSettings` utility (getMonacoOptions, etc.) |
| `global/conts/defaultSettings.js` | Default setting values |

### Non-bundled JS (`inc/`)
| File | Purpose |
|------|---------|
| `monaco-config.js` | `loadMonacoForBlock()` and `loadEmmetForMonaco()` globals |
| `admin-monaco.js` | Footer editor Monaco lifecycle (init, destroy, block sync) |

## Block Attributes (`src/block/block.json`)

- `content` (string) — HTML/code content
- `syntaxHighlight` (boolean) — which variation
- `viewMode` (string) — split/preview/hidden
- `editorLanguage` (string) — language for Monaco/highlight.js
- `useWrapper` (boolean) — wrap output in div
- `scaleHeightWithContent` (boolean) — auto-height Monaco
- `editorHeight` (number) — fixed editor height

## Monaco Loading

Monaco loads **only into the Gutenberg iframe** via `loadMonacoForBlock()`:
1. Dynamically injects `loader.js` script into iframe document
2. Waits for AMD `require` global
3. Configures paths → `require(['vs/editor/editor.main'])`
4. Returns `contextWindow.monaco`

**Never enqueue loader.js on the main admin page** — its AMD `define()` conflicts with jQuery UI and other plugins.

## Settings

Stored as individual WP options with `dblocks_` prefix. Managed via:
- PHP: `DBlocksCodePro_Admin_Settings::get_all_settings()`
- JS: `DBlocksSettings.getAll()` / `DBlocksSettings.getMonacoOptions()`
- REST: `GET/POST /wp-json/dblocks-codepro/v1/settings`

Settings: editor_theme, editor_font_size, editor_line_height, editor_letter_spacing, editor_tab_size, editor_word_wrap, editor_line_numbers, editor_glyph_margin, editor_scroll_beyond_last_line, editor_automatic_layout, editor_copy_button, editor_display_language

## Requirements

- WordPress 7.0+ (blocks v3, mandatory iframe)
- PHP 7.4+
- Monaco Editor 0.55.1 (vendored, auto-copied on build)
