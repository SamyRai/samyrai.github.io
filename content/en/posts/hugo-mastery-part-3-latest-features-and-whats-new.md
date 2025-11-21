---
title: "Hugo Mastery Part 3: Latest Features & What's New in 2024"
date: "2025-11-21"
draft: false
author:
  name: "Damir Mukimov"
  email: ""
tags: ["Hugo", "Updates", "Features", "2024", "Modern Web"]
categories: ["Technology", "Web Development"]
sources: []
description: "Explore the latest features in Hugo v0.152.x, including YAML anchors, transform.HTMLToMarkdown, collections.D, and other powerful new capabilities."
summary: "Stay up-to-date with Hugo's latest features from 2024, including YAML library upgrades, new template functions, and performance improvements."
params:
  reading_time: true
  featured_image: ""
---

## Introduction

Hugo continues to evolve rapidly with regular updates that bring new features, performance improvements, and enhanced developer experience. This article covers the most significant updates from 2024, focusing on practical applications and migration guidance.

## Version Overview

### Recent Major Releases

| Version | Release Date | Key Features |
|---------|-------------|--------------|
| v0.152.x | Oct 2024 | YAML library upgrade, anchors & aliases |
| v0.151.x | Oct 2024 | HTMLToMarkdown, terminal progress, footnote enhancements |
| v0.150.0 | Sep 2024 | Module version control |
| v0.149.0 | Aug 2024 | Go 1.23, collections.D, new permalink tokens |

## Major Features

### 1. YAML Library Upgrade (v0.152.x)

Hugo replaced its YAML parser with a more modern implementation, bringing powerful new capabilities.

#### YAML Anchors & Aliases

The biggest enhancement: reduce configuration duplication with anchors and aliases!

**Before (repetitive):**

```yaml
production:
  author: John Doe
  language: en
  theme: modern
  baseURL: https://example.com

development:
  author: John Doe
  language: en
  theme: modern
  baseURL: http://localhost:1313
```

**After (DRY with anchors):**

```yaml
defaults: &defaults
  author: John Doe
  language: en
  theme: modern

production:
  <<: *defaults
  baseURL: https://example.com

development:
  <<: *defaults
  baseURL: http://localhost:1313
```

#### Real-World Examples

**Menu Configuration:**

```yaml
menu_defaults: &menu_defaults
  class: nav-item
  target: _self

menu:
  main:
    - <<: *menu_defaults
      name: Home
      url: /
      weight: 1

    - <<: *menu_defaults
      name: Blog
      url: /blog/
      weight: 2

    - <<: *menu_defaults
      name: About
      url: /about/
      weight: 3
```

**Multilingual Setup:**

```yaml
lang_defaults: &lang_defaults
  disabled: false
  params:
    dateFormat: "2 January 2006"
    copyright: © 2025 My Site

languages:
  en:
    <<: *lang_defaults
    languageName: English
    weight: 1

  de:
    <<: *lang_defaults
    languageName: Deutsch
    weight: 2
    params:
      dateFormat: "2. January 2006"

  fr:
    <<: *lang_defaults
    languageName: Français
    weight: 3
```

**Environment-Specific Settings:**

```yaml
base_settings: &base
  buildDrafts: false
  buildFuture: false
  buildExpired: false

prod_settings: &prod
  <<: *base
  minify: true
  environment: production
  googleAnalytics: UA-XXXXX-Y

dev_settings: &dev
  <<: *base
  buildDrafts: true
  buildFuture: true
  environment: development

# Use in build configuration
build:
  <<: *prod  # Switch to *dev for development
```

#### Breaking Change: Boolean Handling

**Important Migration Required:**

YAML 1.1 boolean strings are no longer auto-converted.

**Old Behavior:**

```yaml
published: yes   # Converted to true
draft: no        # Converted to false
enabled: on      # Converted to true
disabled: off    # Converted to false
```

**New Behavior:**

```yaml
published: true  # Use explicit boolean
draft: false     # Use explicit boolean
enabled: true    # Use explicit boolean

# Or keep as strings
status: "yes"    # String value "yes"
```

**Migration Script:**

```bash
# Search for old-style booleans
grep -r ": yes$\|: no$\|: on$\|: off$" config/
grep -r ": yes$\|: no$\|: on$\|: off$" content/

# Replace with proper booleans
# `: yes` → `: true`
# `: no` → `: false`
# `: on` → `: true`
# `: off` → `: false`
```

### 2. transform.HTMLToMarkdown (v0.151.0)

Convert HTML content to Markdown format - perfect for content migration, LLM-friendly output, or generating plain text versions.

**Basic Usage:**

```go-html-template
{{ $html := "<h1>Welcome</h1><p>This is <strong>bold</strong> text.</p>" }}
{{ $markdown := transform.HTMLToMarkdown $html }}
{{ $markdown }}
<!-- Output: # Welcome\n\nThis is **bold** text. -->
```

**Convert Page Content:**

```go-html-template
<!-- Convert current page HTML to Markdown -->
{{ $markdown := transform.HTMLToMarkdown .Content }}

<!-- Use for API endpoints or exports -->
{{ $markdown | safeHTML }}
```

**Real-World Use Case: LLM-Friendly API:**

```go-html-template
<!-- layouts/_default/llm.txt -->
{{- range .Site.RegularPages -}}
Title: {{ .Title }}
URL: {{ .Permalink }}
Date: {{ .Date.Format "2006-01-02" }}

Content:
{{ transform.HTMLToMarkdown .Content }}

---

{{ end }}
```

**Use Case: Content Export:**

```go-html-template
<!-- layouts/_default/export.md -->
{{- $pages := where .Site.RegularPages "Type" "posts" -}}
{{- range $pages -}}
# {{ .Title }}

{{ transform.HTMLToMarkdown .Content }}

---

{{ end }}
```

### 3. collections.D (v0.149.0)

Efficient random sampling using Vitter's Method D - "The Best Algorithm No One Knows About".

**Syntax:**

```go-html-template
{{ collections.D $sampleSize $populationSize }}
```

**Random Posts Sidebar:**

```go-html-template
<!-- Select 5 random posts -->
{{ $allPosts := where .Site.RegularPages "Type" "posts" }}
{{ $indices := collections.D 5 (len $allPosts) }}

<aside class="random-posts">
  <h3>You Might Also Like</h3>
  {{ range $indices }}
    {{ $post := index $allPosts . }}
    <article>
      <h4><a href="{{ $post.Permalink }}">{{ $post.Title }}</a></h4>
      <p>{{ $post.Summary }}</p>
    </article>
  {{ end }}
</aside>
```

**Random Image Gallery:**

```go-html-template
{{ $images := .Resources.Match "gallery/*" }}
{{ $totalImages := len $images }}
{{ $displayCount := 6 }}

{{ $randomIndices := collections.D $displayCount $totalImages }}

<div class="gallery">
  {{ range $randomIndices }}
    {{ $img := index $images . }}
    <img src="{{ $img.RelPermalink }}" alt="{{ $img.Name }}">
  {{ end }}
</div>
```

**Random Testimonials:**

```go-html-template
{{ $testimonials := .Site.Data.testimonials }}
{{ $count := len $testimonials }}
{{ $randomIndices := collections.D 3 $count }}

<section class="testimonials">
  {{ range $randomIndices }}
    {{ $testimonial := index $testimonials . }}
    <blockquote>
      <p>{{ $testimonial.quote }}</p>
      <cite>{{ $testimonial.author }}</cite>
    </blockquote>
  {{ end }}
</section>
```

**Performance Note:** Method D is more efficient than shuffling the entire collection, especially with large datasets.

### 4. Module Version Control (v0.150.0)

Directly specify module versions in your configuration!

**Before:**

```bash
# Required manual go.mod editing or hugo mod get
hugo mod get github.com/user/theme@v1.2.3
```

**After:**

```toml
[[module.imports]]
  path = "github.com/user/theme"
  version = "v1.2.3"
```

**Multi-Version Documentation:**

```toml
# Maintain multiple API versions
[[module.imports]]
  path = "github.com/mycompany/api-docs"
  version = "v3.0.0"
  [[module.imports.mounts]]
    source = "content"
    target = "content/docs/v3"

[[module.imports]]
  path = "github.com/mycompany/api-docs"
  version = "v2.1.0"
  [[module.imports.mounts]]
    source = "content"
    target = "content/docs/v2"

[[module.imports]]
  path = "github.com/mycompany/api-docs"
  version = "v1.5.0"
  [[module.imports.mounts]]
    source = "content"
    target = "content/docs/v1"
```

**Development vs Production:**

```toml
# config/production/config.toml
[[module.imports]]
  path = "github.com/user/theme"
  version = "v2.1.0"  # Stable version

# config/development/config.toml
[[module.imports]]
  path = "github.com/user/theme"
  version = "main"  # Latest development
```

### 5. New Permalink Tokens (v0.149.0)

Enhanced permalink customization with new tokens.

**New Tokens:**

- `:sectionslug` - Section slug for current page
- `:sectionslugs` - All section slugs in path

**Multilingual Example:**

```toml
[permalinks]
  posts = "/:year/:sectionslug/:slug/"

# Results:
# English: /2024/blog/my-post/
# German: /2024/nachrichten/mein-beitrag/
```

**Nested Sections:**

```toml
[permalinks]
  docs = "/:sectionslugs/:slug/"

# Results:
# /docs/getting-started/installation/
# /docs/advanced/optimization/
```

### 6. Footnote Enhancements (v0.151.0)

Better control over footnote rendering.

**Configuration:**

```toml
[markup.goldmark.extensions.footnote]
  returnLinkContents = "↩"
  autoPrefix = true  # Auto-prefix footnote IDs to prevent conflicts
```

**Custom Backlink HTML:**

```toml
[markup.goldmark.extensions.footnote]
  backlinkHTML = '<sup><a href="#fnref:%s" class="footnote-backref" role="doc-backlink">↩︎</a></sup>'
```

**Why This Matters:**

Without `autoPrefix`, footnote IDs can conflict across pages in single-page applications or when combining content.

### 7. Terminal Progress Indicators (v0.151.0)

Visual progress bars in modern terminals.

**Supported Terminals:**

- Ghostty
- Windows Terminal
- Other terminals supporting OSC 9;4 protocol

**What You See:**

```
Building sites … ████████████░░░░░░░░ 60%
```

**No Configuration Required:** Works automatically if your terminal supports it.

### 8. Go 1.23 Upgrade (v0.149.0)

Hugo now uses Go 1.23, bringing:

- Performance improvements
- Better error messages
- Enhanced security (10 security patches)
- Improved standard library

## Security Updates

### Recent Security Patches

**v0.151.0:**

- Upgraded to Go 1.23.3 with 10 security fixes
- Updated `net/html` package with security patches
- No direct Hugo vulnerabilities but ensures clean security reports

**Best Practices:**

```toml
[security]
  enableInlineShortcodes = false

  [security.exec]
    allow = ['^dart-sass-embedded$', '^go$', '^npx$', '^postcss$']
    osEnv = ['(?i)^(PATH|PATHEXT|APPDATA|TMP|TEMP|TERM)$']

  [security.funcs]
    getenv = ['^HUGO_', '^CI$']

  [security.http]
    methods = ['(?i)GET|POST']
    urls = ['.*']
```

## Bug Fixes & Improvements

### v0.151.0

- **CJK Handling:** Fixed `strings/truncate` for Chinese/Japanese/Korean text
- **Shortcodes:** Fixed nesting regression
- **Error Handling:** Improved error messages for shortcode syntax

### v0.150.0

- **Summary Logic:** Fixed truncated summary edge cases
- **Windows Support:** Added PROGRAMDATA to osenv allowlist

### v0.149.0

- **Live Reload:** Fixed rebuild when adding new leaf bundles
- **Content Adapters:** Fixed rebuild when deleting content adapter files
- **ToC:** Fixed nil pointer on ToC headings
- **YAML Types:** Fixed integer type handling

## Migration Guide

### YAML Boolean Migration

**Step 1: Find Issues**

```bash
grep -r ": yes$\|: no$\|: on$\|: off$" config/
grep -r ": yes$\|: no$\|: on$\|: off$" content/
```

**Step 2: Replace**

| Old | New |
|-----|-----|
| `: yes` | `: true` |
| `: no` | `: false` |
| `: on` | `: true` |
| `: off` | `: false` |

**Step 3: Test**

```bash
hugo --debug
```

### Module Version Migration

**Step 1: Check Current Versions**

```bash
hugo mod graph
```

**Step 2: Add to Config**

```toml
[[module.imports]]
  path = "github.com/user/module"
  version = "v1.2.3"  # Use version from hugo mod graph
```

**Step 3: Clean and Update**

```bash
hugo mod clean
hugo mod get -u
```

## Practical Examples

### Example 1: Complete Modern Configuration

```yaml
# hugo.yaml
baseURL: https://example.com
languageCode: en-us
title: My Modern Site

# Use YAML anchors for DRY config
_defaults: &defaults
  author: John Doe
  theme: modern

_prod: &prod
  <<: *defaults
  minify: true
  environment: production

_dev: &dev
  <<: *defaults
  buildDrafts: true
  environment: development

# Current environment (switch based on HUGO_ENVIRONMENT)
params:
  <<: *prod

module:
  imports:
    - path: github.com/user/theme
      version: v2.1.0
    - path: github.com/user/components
      version: main

markup:
  goldmark:
    extensions:
      footnote:
        autoPrefix: true
        returnLinkContents: "↩"
```

### Example 2: Random Content Showcase

```go-html-template
<!-- layouts/partials/random-showcase.html -->
{{ $allContent := where .Site.RegularPages "Type" "in" (slice "posts" "projects") }}
{{ $totalItems := len $allContent }}
{{ $showCount := 4 }}

{{ if gt $totalItems $showCount }}
  {{ $randomIndices := collections.D $showCount $totalItems }}

  <section class="random-showcase">
    <h2>Discover More</h2>
    <div class="showcase-grid">
      {{ range $randomIndices }}
        {{ $item := index $allContent . }}
        <article class="showcase-item">
          <h3><a href="{{ $item.Permalink }}">{{ $item.Title }}</a></h3>
          <p>{{ $item.Summary }}</p>
          <span class="type">{{ $item.Type }}</span>
        </article>
      {{ end }}
    </div>
  </section>
{{ end }}
```

### Example 3: Content API with Markdown

```go-html-template
<!-- layouts/_default/api.json -->
{{- $pages := where .Site.RegularPages "Type" "posts" | first 50 -}}
{{- $items := slice -}}
{{- range $pages -}}
  {{- $item := dict
      "title" .Title
      "url" .Permalink
      "date" (.Date.Format "2006-01-02")
      "summary" .Summary
      "content_html" .Content
      "content_markdown" (transform.HTMLToMarkdown .Content)
      "tags" .Params.tags
  -}}
  {{- $items = $items | append $item -}}
{{- end -}}
{{- dict "items" $items | jsonify -}}
```

## Best Practices for 2024

### 1. Use YAML Anchors

Reduce duplication and make configuration more maintainable:

```yaml
# Good
defaults: &defaults
  setting1: value1
  setting2: value2

config1:
  <<: *defaults
  specific: override

# Bad - repetitive
config1:
  setting1: value1
  setting2: value2
  specific: override
```

### 2. Pin Module Versions

Ensure reproducible builds:

```toml
# Good - explicit versions
[[module.imports]]
  path = "github.com/user/theme"
  version = "v2.1.0"

# Acceptable for development
[[module.imports]]
  path = "github.com/user/experimental"
  version = "main"
```

### 3. Enable Auto-Prefix for Footnotes

Prevent ID conflicts:

```toml
[markup.goldmark.extensions.footnote]
  autoPrefix = true
```

### 4. Use collections.D for Random Content

More efficient than shuffling:

```go-html-template
<!-- Good -->
{{ $random := collections.D 5 (len .Pages) }}

<!-- Less efficient -->
{{ $shuffled := shuffle .Pages | first 5 }}
```

### 5. Keep Hugo Updated

```bash
# Check version
hugo version

# Update (macOS with Homebrew)
brew upgrade hugo

# Verify
hugo version
```

## What's Coming Next

Based on community discussions and development trends:

1. **Enhanced Content Adapters:** More flexible content import options
2. **Improved Caching:** Better partial caching strategies
3. **Advanced Image Processing:** New filters and format options
4. **Module Ecosystem:** Enhanced dependency management
5. **Developer Experience:** Better debugging tools

## Conclusion

Hugo's 2024 updates bring significant improvements in configuration management, content transformation, and developer experience. The YAML anchors feature alone can dramatically reduce configuration duplication, while new functions like `collections.D` and `transform.HTMLToMarkdown` enable powerful new use cases.

Stay updated by following [Hugo releases](https://github.com/gohugoio/hugo/releases) and join the [Hugo community](https://discourse.gohugo.io/).

In the final part of this series, we'll explore Hugo's complete template function library with practical examples.

## Resources

- [Hugo Release Notes](https://github.com/gohugoio/hugo/releases)
- [Hugo Documentation](https://gohugo.io/documentation/)
- [Hugo Forum](https://discourse.gohugo.io/)

---

*This is Part 3 of the Hugo Mastery series. [← Back to Part 2](/posts/hugo-mastery-part-2-module-system-and-advanced-configuration) | [Continue to Part 4: Template Functions Mastery →](/posts/hugo-mastery-part-4-template-functions-mastery)*
