---
title: "Hugo Mastery Part 2: Module System & Advanced Configuration"
date: "2025-11-21"
draft: false
[author]
name: "Damir Mukimov"
email: ""
tags: ["Hugo", "Modules", "Configuration", "YAML", "Advanced"]
categories: ["Technology", "Web Development"]
sources: []
description: "Master Hugo's module system and advanced configuration patterns, including YAML anchors, version control, and environment-specific setups."
summary: "Explore Hugo's powerful module system, learn to use YAML anchors for DRY configuration, and implement advanced patterns for complex sites."
[params]
reading_time = true
featured_image = ""
---

## Introduction

In [Part 1](/posts/hugo-mastery-part-1-configuration-and-best-practices), we covered the fundamentals of Hugo configuration. Now, let's dive into the advanced features that make Hugo truly powerful: the module system and sophisticated configuration patterns.

## Hugo Module System

Hugo's module system allows you to import themes, components, and content from external sources. It's built on Go modules and provides powerful dependency management.

### Module Version Control

**New in Hugo v0.150.0**: You can now specify module versions directly in your configuration!

```toml
[module]
  [[module.imports]]
    path = "github.com/user/theme"
    version = "v2.1.0"  # Specific version

  [[module.imports]]
    path = "github.com/user/components"
    version = "main"  # Branch name
```

#### Version Query Formats

Hugo supports various version specifications:

| Query Format | Description | Example |
|--------------|-------------|---------|
| `v1.2.3` | Exact version | `v2.1.0` |
| `v1` | Latest v1.x.x | `v1` |
| `v1.2` | Latest v1.2.x | `v1.2` |
| `latest` | Latest tagged version | `latest` |
| `main` | Branch name | `main`, `develop` |
| `>=v1.2.3` | Version constraint | `>=v1.0.0` |

#### Real-World Example: Multi-Version Documentation

```toml
# Mount multiple API documentation versions
[module]
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

### Module Mounts

Mounts allow you to map source directories to target locations in your Hugo project.

#### Basic Mounts

```toml
[module]
  [[module.mounts]]
    source = "content"
    target = "content"

  [[module.mounts]]
    source = "static"
    target = "static"

  [[module.mounts]]
    source = "assets"
    target = "assets"
```

#### Advanced Mount Patterns

**Content Organization:**

```toml
[module]
  # Reorganize content structure
  [[module.mounts]]
    source = "content/blog"
    target = "content/posts"

  [[module.mounts]]
    source = "content/documentation"
    target = "content/docs"

  # Mount external content
  [[module.mounts]]
    source = "node_modules/bootstrap/dist"
    target = "assets/vendor/bootstrap"
```

**Multilingual Mounts:**

```toml
[module]
  [[module.mounts]]
    source = "content/en"
    target = "content"
    lang = "en"

  [[module.mounts]]
    source = "content/de"
    target = "content"
    lang = "de"

  [[module.mounts]]
    source = "content/fr"
    target = "content"
    lang = "fr"
```

**Include/Exclude Patterns:**

```toml
[module]
  [[module.mounts]]
    source = "content"
    target = "content"
    includeFiles = ["*.md", "*.html"]
    excludeFiles = ["drafts/**", "archive/**"]
```

### Working with Node Modules

**New in v0.152.2**: Hugo now handles `node_modules` mounting intelligently:

```toml
[module]
  # Hugo checks theme's node_modules first, then project root
  [[module.mounts]]
    source = "node_modules/bootstrap"
    target = "assets/vendor/bootstrap"

  [[module.mounts]]
    source = "node_modules/@fortawesome/fontawesome-free"
    target = "assets/vendor/fontawesome"
```

### Complete Module Configuration

```toml
[module]
  # Proxy settings for restricted networks
  proxy = "https://proxy.example.com"
  noProxy = "github.com"

  # Private repository access
  private = ["github.com/mycompany/*"]

  # Workspace mode (for local development)
  workspace = "hugo.work"

  # Module imports with versions
  [[module.imports]]
    path = "github.com/user/theme"
    version = "v2.0.0"
    disable = false

  # Module replacements (for local development)
  [[module.replacements]]
    from = "github.com/old/module"
    to = "github.com/new/module"
    version = "v1.0.0"
```

## YAML Enhancements

### YAML Anchors & Aliases

**New in Hugo v0.152.0**: YAML now supports anchors and aliases to reduce configuration duplication!

#### Basic Anchors

```yaml
# Define reusable configuration
defaults: &defaults
  author: John Doe
  language: en
  theme: modern

# Reuse with alias
production:
  <<: *defaults
  baseURL: https://example.com
  environment: production

development:
  <<: *defaults
  baseURL: http://localhost:1313
  environment: development
```

#### Menu Configuration with Anchors

```yaml
# Define common menu properties
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

#### Complex Anchors with Merge

```yaml
# Base settings
base_settings: &base
  buildDrafts: false
  buildFuture: false
  buildExpired: false

# Production overrides
prod_settings: &prod
  <<: *base
  minify: true
  environment: production

# Development overrides
dev_settings: &dev
  <<: *base
  buildDrafts: true
  environment: development

# Use based on context
build:
  <<: *prod  # Switch to *dev for development
```

#### Multilingual with Anchors

```yaml
# Common language settings
lang_defaults: &lang_defaults
  weight: 1
  disabled: false

# Common parameters
params_defaults: &params
  description: Default description
  copyright: © 2025 My Site

languages:
  en:
    <<: *lang_defaults
    languageName: English
    languageCode: en-us
    params:
      <<: *params
      description: English site description

  de:
    <<: *lang_defaults
    languageName: Deutsch
    languageCode: de
    weight: 2
    params:
      <<: *params
      description: Deutsche Seitenbeschreibung

  fr:
    <<: *lang_defaults
    languageName: Français
    languageCode: fr
    weight: 3
    params:
      <<: *params
      description: Description du site en français
```

### YAML Boolean Changes (Breaking)

**Important**: YAML 1.1 boolean strings are no longer auto-converted.

#### Migration Required

**Before (YAML 1.1):**

```yaml
published: yes   # Was converted to true
draft: no        # Was converted to false
enabled: on      # Was converted to true
```

**After (Current):**

```yaml
published: true  # Use explicit boolean
draft: false     # Use explicit boolean
enabled: true    # Use explicit boolean

# Or keep as strings (quoted)
status: "yes"    # String value "yes"
```

#### Search and Replace Guide

| Old Value | Replace With | Context |
|-----------|--------------|---------|
| `: yes` | `: true` | Boolean true |
| `: no` | `: false` | Boolean false |
| `: on` | `: true` | Boolean true |
| `: off` | `: false` | Boolean false |

## Advanced Configuration Patterns

### Environment-Specific Configuration

Organize configurations by environment for maximum flexibility.

**Directory Structure:**

```
config/
├── _default/
│   ├── config.toml
│   ├── params.toml
│   └── menus.toml
├── production/
│   ├── config.toml
│   └── params.toml
├── staging/
│   ├── config.toml
│   └── params.toml
└── development/
    ├── config.toml
    └── params.toml
```

**config/_default/config.toml:**

```toml
baseURL = "https://example.com"
title = "My Site"
theme = "mytheme"
```

**config/production/config.toml:**

```toml
minify = true
googleAnalytics = "UA-XXXXX-Y"

[params]
  environment = "production"
  comments = true
  analytics = true
```

**config/development/config.toml:**

```toml
baseURL = "http://localhost:1313"
buildDrafts = true
buildFuture = true

[params]
  environment = "development"
  comments = false
  analytics = false
```

**Run with specific environment:**

```bash
hugo server                    # Uses _default + development
hugo --environment production  # Uses _default + production
hugo --environment staging     # Uses _default + staging
```

### Feature Flags Pattern

Implement feature toggles for gradual rollouts:

```toml
# config/_default/params.toml
[features]
  comments = true
  analytics = true
  search = true
  darkMode = true
  newsletter = false

[features.experimental]
  aiChat = false
  voiceSearch = false
  recommendationEngine = false
```

**Usage in templates:**

```go-html-template
{{ if .Site.Params.features.comments }}
  {{ partial "comments.html" . }}
{{ end }}

{{ if .Site.Params.features.experimental.aiChat }}
  {{ partial "ai-chat.html" . }}
{{ end }}
```

### Cascading Configuration

Apply settings to entire sections:

**content/blog/_index.md:**

```yaml
---
title: Blog
cascade:
  type: posts
  layout: single
  params:
    sidebar: true
    toc: true
    comments: true
---
```

All pages under `/blog/` inherit these settings automatically.

**Targeted Cascade:**

```yaml
---
title: Home
cascade:
  - _target:
      kind: page
      path: /blog/**
    params:
      layout: blog-post

  - _target:
      kind: page
      path: /docs/**
    params:
      layout: documentation
---
```

### Performance Configuration

```toml
[caches]
  [caches.getjson]
    dir = ":cacheDir/:project"
    maxAge = "24h"

  [caches.getcsv]
    dir = ":cacheDir/:project"
    maxAge = "24h"

  [caches.images]
    dir = ":resourceDir/_gen"
    maxAge = -1  # Never expire

  [caches.assets]
    dir = ":resourceDir/_gen"
    maxAge = -1

  [caches.modules]
    dir = ":cacheDir/modules"
    maxAge = -1
```

## Multilingual Configuration

### Advanced Multilingual Setup

```toml
defaultContentLanguage = "en"
defaultContentLanguageInSubdir = true

[languages]
  [languages.en]
    languageName = "English"
    languageCode = "en-us"
    weight = 1
    title = "My Site"

    [languages.en.params]
      description = "English description"

  [languages.de]
    languageName = "Deutsch"
    languageCode = "de"
    weight = 2
    title = "Meine Website"

    [languages.de.params]
      description = "Deutsche Beschreibung"

  [languages.fr]
    languageName = "Français"
    languageCode = "fr"
    weight = 3
    title = "Mon Site"

    [languages.fr.params]
      description = "Description française"
```

### Language-Specific Menus

```toml
[languages.en.menu]
  [[languages.en.menu.main]]
    name = "Home"
    url = "/"
    weight = 1

  [[languages.en.menu.main]]
    name = "Blog"
    url = "/blog/"
    weight = 2

[languages.de.menu]
  [[languages.de.menu.main]]
    name = "Startseite"
    url = "/"
    weight = 1

  [[languages.de.menu.main]]
    name = "Blog"
    url = "/blog/"
    weight = 2
```

### Using YAML Anchors for Multilingual

```yaml
# Common language structure
language_template: &lang_template
  disabled: false
  params:
    dateFormat: "2 January 2006"

languages:
  en:
    <<: *lang_template
    languageName: English
    languageCode: en-us
    weight: 1
    title: My Site

  de:
    <<: *lang_template
    languageName: Deutsch
    languageCode: de
    weight: 2
    title: Meine Website
    params:
      dateFormat: "2. January 2006"
```

## Module Management Commands

### Essential Commands

```bash
# Initialize module
hugo mod init github.com/user/repo

# Get/update modules
hugo mod get -u                              # Update all
hugo mod get github.com/user/module@v1.2.3   # Specific version
hugo mod get github.com/user/module@main     # Branch

# Maintenance
hugo mod tidy                                # Remove unused
hugo mod clean                               # Clear cache
hugo mod vendor                              # Vendor locally
hugo mod graph                               # Show dependencies
```

### Troubleshooting Modules

```bash
# Clear module cache
hugo mod clean

# Force update
hugo mod get -u

# Check module dependency tree
hugo mod graph

# Verify module configuration
hugo config
```

## Practical Examples

### Example 1: Complete Module Setup

```toml
[module]
  # Theme module with specific version
  [[module.imports]]
    path = "github.com/user/hugo-theme-awesome"
    version = "v2.1.0"

  # Component library
  [[module.imports]]
    path = "github.com/user/hugo-components"
    version = "main"

  # Icon library from npm
  [[module.mounts]]
    source = "node_modules/@fortawesome/fontawesome-free/webfonts"
    target = "static/webfonts"

  [[module.mounts]]
    source = "node_modules/@fortawesome/fontawesome-free/css"
    target = "assets/vendor/fontawesome/css"
```

### Example 2: Multi-Environment Setup with YAML

```yaml
# config.yaml
_base_config: &base
  title: My Awesome Site
  theme: mytheme
  paginate: 10

_prod_settings: &prod
  minify: true
  googleAnalytics: UA-XXXXX-Y

_dev_settings: &dev
  buildDrafts: true
  buildFuture: true

# Select based on HUGO_ENVIRONMENT
production:
  <<: [*base, *prod]
  baseURL: https://mysite.com

development:
  <<: [*base, *dev]
  baseURL: http://localhost:1313
```

### Example 3: Feature Flag Implementation

```yaml
# config/_default/params.yaml
features:
  comments: &comments_enabled true
  analytics: &analytics_enabled true
  search: &search_enabled true

# Development overrides
# config/development/params.yaml
features:
  comments: false  # Override comments in dev
  analytics: false # Override analytics in dev
  search: *search_enabled  # Keep search enabled
```

## Best Practices

1. **Version Control**: Pin module versions in production
2. **DRY Configuration**: Use YAML anchors to reduce duplication
3. **Environment Separation**: Use config directories for different environments
4. **Cache Management**: Configure appropriate cache durations
5. **Module Updates**: Regularly update modules but test thoroughly
6. **Documentation**: Comment your configuration files
7. **Security**: Use security settings to restrict external access

## Conclusion

Hugo's module system and advanced configuration capabilities provide the flexibility needed for complex, production-ready websites. By mastering these features, you can create maintainable, scalable sites with minimal code duplication.

In the next part of this series, we'll explore Hugo's latest features and the powerful template function system.

## Resources

- [Hugo Modules Documentation](https://gohugo.io/hugo-modules/)
- [Configuration Documentation](https://gohugo.io/getting-started/configuration/)
- [Go Modules Reference](https://go.dev/ref/mod)

---

*This is Part 2 of the Hugo Mastery series. [← Back to Part 1](/posts/hugo-mastery-part-1-configuration-and-best-practices) | [Continue to Part 3: Latest Features & What's New →](/posts/hugo-mastery-part-3-latest-features-and-whats-new)*
