---
title: "Hugo Mastery Part 4: Template Functions Mastery"
date: "2025-11-21"
draft: false
[author]
name: "Damir Mukimov"
email: ""
tags: ["Hugo", "Templates", "Functions", "Web Development", "Go Templates"]
categories: ["Technology", "Web Development"]
sources: []
description: "Master Hugo's 200+ template functions with practical examples, performance tips, and advanced patterns for building dynamic static sites."
summary: "Complete guide to Hugo template functions, from basic string manipulation to advanced content transformation, with real-world examples and performance optimization."
[params]
reading_time = true
featured_image = ""
---

## Introduction

Hugo provides over 200 built-in template functions that enable powerful content manipulation and dynamic site generation. This guide covers the most useful functions with practical examples you can use immediately.

## Function Categories

### Collections: Working with Data

Collections functions help you filter, sort, and manipulate arrays, slices, and page collections.

#### Filtering and Selection

**where - Filter collections:**

```go-html-template
<!-- Featured posts -->
{{ $featured := where .Site.RegularPages "Params.featured" true }}

<!-- Posts from last month -->
{{ $recent := where .Site.RegularPages "Date" "gt" (now.AddDate 0 -1 0) }}

<!-- Multiple conditions -->
{{ $posts := where .Site.RegularPages "Type" "posts" }}
{{ $popular := where $posts ".Params.views" ">=" 1000 }}
```

**first / last / after:**

```go-html-template
<!-- First 5 posts -->
{{ range first 5 .Pages }}
  <h2>{{ .Title }}</h2>
{{ end }}

<!-- Last 3 posts -->
{{ range last 3 .Pages }}
  <h2>{{ .Title }}</h2>
{{ end }}

<!-- Skip first 10, show rest -->
{{ range after 10 .Pages }}
  <h2>{{ .Title }}</h2>
{{ end }}
```

**Practical Example: Latest Posts Sidebar**

```go-html-template
<!-- layouts/partials/sidebar-recent.html -->
<aside class="recent-posts">
  <h3>Recent Posts</h3>
  {{ $recent := where .Site.RegularPages "Type" "posts" | first 5 }}
  <ul>
    {{ range $recent }}
      <li>
        <a href="{{ .Permalink }}">{{ .Title }}</a>
        <time>{{ .Date.Format "Jan 2" }}</time>
      </li>
    {{ end }}
  </ul>
</aside>
```

#### Grouping and Sorting

**group / groupByDate:**

```go-html-template
<!-- Group posts by year -->
{{ range .Pages.GroupByDate "2006" }}
  <section>
    <h2>{{ .Key }}</h2>
    <ul>
      {{ range .Pages }}
        <li><a href="{{ .Permalink }}">{{ .Title }}</a></li>
      {{ end }}
    </ul>
  </section>
{{ end }}

<!-- Group by category -->
{{ range .Pages.GroupBy "Params.category" }}
  <section>
    <h2>{{ .Key }}</h2>
    {{ range .Pages }}
      <article>{{ .Title }}</article>
    {{ end }}
  </section>
{{ end }}
```

**sort / reverse:**

```go-html-template
<!-- Sort by date (newest first) -->
{{ range .Pages.ByDate.Reverse }}
  {{ .Title }}
{{ end }}

<!-- Sort by custom parameter -->
{{ range sort .Pages ".Params.priority" "desc" }}
  {{ .Title }}
{{ end }}

<!-- Sort by weight -->
{{ range .Pages.ByWeight }}
  {{ .Title }}
{{ end }}
```

**Practical Example: Posts Archive by Year**

```go-html-template
<!-- layouts/posts/archive.html -->
<div class="archive">
  <h1>Post Archive</h1>
  {{ range .Site.RegularPages.GroupByDate "2006" "desc" }}
    <section class="year">
      <h2>{{ .Key }}</h2>
      {{ range .Pages.GroupByDate "January" }}
        <div class="month">
          <h3>{{ .Key }}</h3>
          <ul>
            {{ range .Pages }}
              <li>
                <time>{{ .Date.Format "Jan 2" }}</time>
                <a href="{{ .Permalink }}">{{ .Title }}</a>
              </li>
            {{ end }}
          </ul>
        </div>
      {{ end }}
    </section>
  {{ end }}
</div>
```

#### Data Structures

**slice / append:**

```go-html-template
{{ $mySlice := slice "a" "b" "c" }}
{{ $newSlice := $mySlice | append "d" }}
<!-- Result: [a b c d] -->

<!-- Combine slices -->
{{ $combined := $slice1 | append $slice2 }}
```

**dict / merge:**

```go-html-template
<!-- Create dictionary -->
{{ $myDict := dict "name" "Hugo" "version" "0.152.0" }}
{{ $myDict.name }}  <!-- Hugo -->

<!-- Merge dictionaries (right overwrites left) -->
{{ $defaults := dict "theme" "dark" "lang" "en" }}
{{ $user := dict "theme" "light" }}
{{ $config := merge $user $defaults }}
<!-- Result: theme=light, lang=en -->
```

**Practical Example: Flexible Partial Parameters**

```go-html-template
<!-- layouts/partials/card.html -->
{{ $defaults := dict
    "showImage" true
    "showDate" true
    "showAuthor" false
    "class" "card"
}}
{{ $params := merge . $defaults }}

<article class="{{ $params.class }}">
  {{ if $params.showImage }}
    {{ with .Params.image }}
      <img src="{{ . }}" alt="{{ $.Title }}">
    {{ end }}
  {{ end }}

  <h3>{{ .Title }}</h3>

  {{ if $params.showDate }}
    <time>{{ .Date.Format "January 2, 2006" }}</time>
  {{ end }}

  {{ if $params.showAuthor }}
    <span class="author">{{ .Params.author }}</span>
  {{ end }}
</article>

<!-- Usage -->
{{ partial "card.html" (dict "Page" . "showAuthor" true) }}
```

#### Random Sampling (New!)

**collections.D:**

```go-html-template
<!-- Random posts -->
{{ $allPosts := where .Site.RegularPages "Type" "posts" }}
{{ $indices := collections.D 5 (len $allPosts) }}

{{ range $indices }}
  {{ $post := index $allPosts . }}
  <article>{{ $post.Title }}</article>
{{ end }}
```

### Transform: Content Conversion

#### Markdown and HTML

**transform.Markdownify:**

```go-html-template
{{ $md := "This is **bold** and this is *italic*" }}
{{ $html := markdownify $md }}
<!-- Output: <p>This is <strong>bold</strong> and this is <em>italic</em></p> -->
```

**transform.HTMLToMarkdown (New!):**

```go-html-template
{{ $html := "<h1>Title</h1><p>Content</p>" }}
{{ $md := transform.HTMLToMarkdown $html }}
<!-- Output: # Title\n\nContent -->
```

**transform.Plainify:**

```go-html-template
{{ $html := "<p>Hello <strong>World</strong></p>" }}
{{ $plain := plainify $html }}
<!-- Output: Hello World -->
```

**Practical Example: SEO Description**

```go-html-template
<!-- layouts/partials/seo.html -->
{{ $description := "" }}
{{ if .Description }}
  {{ $description = .Description }}
{{ else if .Summary }}
  {{ $description = .Summary | plainify | truncate 160 }}
{{ else }}
  {{ $description = .Site.Params.description }}
{{ end }}

<meta name="description" content="{{ $description }}">
```

#### Data Parsing

**transform.Unmarshal:**

```go-html-template
<!-- Parse JSON -->
{{ $json := `{"name": "Hugo", "version": "0.152.0"}` }}
{{ $data := transform.Unmarshal $json }}
{{ $data.name }}  <!-- Hugo -->

<!-- Parse YAML with explicit format -->
{{ $yaml := `
name: Hugo
version: 0.152.0
features:
  - fast
  - flexible
` }}
{{ $data := transform.Unmarshal (dict "format" "yaml") $yaml }}
{{ $data.version }}  <!-- 0.152.0 -->
{{ range $data.features }}
  <li>{{ . }}</li>
{{ end }}

<!-- Parse remote JSON -->
{{ $remote := resources.GetRemote "https://api.example.com/data.json" }}
{{ with $remote }}
  {{ $data := .Content | transform.Unmarshal }}
  {{ $data.value }}
{{ end }}
```

**Practical Example: Data-Driven Navigation**

```go-html-template
<!-- data/navigation.yaml -->
main:
  - name: Home
    url: /
    icon: home
  - name: Blog
    url: /blog/
    icon: edit

<!-- layouts/partials/navigation.html -->
{{ $nav := .Site.Data.navigation.main }}
<nav>
  {{ range $nav }}
    <a href="{{ .url }}" class="nav-item">
      <i class="icon-{{ .icon }}"></i>
      {{ .name }}
    </a>
  {{ end }}
</nav>
```

### Strings: Text Manipulation

#### Basic Operations

**strings/truncate:**

```go-html-template
<!-- Truncate to 100 characters -->
{{ .Summary | truncate 100 }}

<!-- Custom suffix -->
{{ .Summary | truncate 100 " [read more]" }}
```

**strings/replace / replaceRE:**

```go-html-template
<!-- Simple replace -->
{{ $text := "Hello World" }}
{{ replace $text "World" "Hugo" }}
<!-- Output: Hello Hugo -->

<!-- Regex replace -->
{{ $text := "Phone: 123-456-7890" }}
{{ replaceRE `\d{3}-\d{3}-\d{4}` "XXX-XXX-XXXX" $text }}
<!-- Output: Phone: XXX-XXX-XXXX -->
```

**strings/upper / lower / title:**

```go-html-template
{{ "hello world" | upper }}  <!-- HELLO WORLD -->
{{ "HELLO WORLD" | lower }}  <!-- hello world -->
{{ "hello world" | title }}  <!-- Hello World -->
```

**strings/trim / chomp:**

```go-html-template
{{ "  hello  " | strings.Trim " " }}  <!-- hello -->
{{ "hello\n\n" | chomp }}  <!-- hello (removes trailing newlines) -->
```

**Practical Example: Clean File Names**

```go-html-template
{{ $filename := .File.BaseFileName }}
{{ $clean := $filename | replaceRE `[-_]+` " " | title }}
<!-- my-blog-post → My Blog Post -->
```

#### Advanced String Operations

**strings/split / delimit:**

```go-html-template
<!-- Split string into array -->
{{ $parts := split "a,b,c" "," }}
<!-- $parts = [a b c] -->

<!-- Join array into string -->
{{ $joined := delimit $parts " | " }}
<!-- Output: a | b | c -->
```

**strings/contains / hasPrefix / hasSuffix:**

```go-html-template
{{ if strings.Contains .Title "Hugo" }}
  <span class="hugo-post">🎯</span>
{{ end }}

{{ if hasPrefix .File.Path "posts/" }}
  <!-- File is in posts directory -->
{{ end }}

{{ if hasSuffix .File.Path ".md" }}
  <!-- File is markdown -->
{{ end }}
```

**Practical Example: Dynamic Class Names**

```go-html-template
{{ $classes := slice }}

{{ if .Params.featured }}
  {{ $classes = $classes | append "featured" }}
{{ end }}

{{ if eq .Type "posts" }}
  {{ $classes = $classes | append "post" }}
{{ end }}

{{ if .Params.hero_image }}
  {{ $classes = $classes | append "has-hero" }}
{{ end }}

<article class="{{ delimit $classes " " }}">
  <!-- Content -->
</article>
```

### Math: Calculations

#### Basic Operations

```go-html-template
{{ add 1 2 }}      <!-- 3 -->
{{ sub 10 3 }}     <!-- 7 -->
{{ mul 4 5 }}      <!-- 20 -->
{{ div 10 2 }}     <!-- 5 -->
{{ mod 10 3 }}     <!-- 1 -->
```

#### Advanced Math

```go-html-template
{{ math.Pow 2 8 }}      <!-- 256 -->
{{ math.Sqrt 16 }}      <!-- 4 -->
{{ math.Ceil 4.2 }}     <!-- 5 -->
{{ math.Floor 4.7 }}    <!-- 4 -->
{{ math.Round 4.5 }}    <!-- 5 -->
```

**Practical Example: Reading Progress Bar**

```go-html-template
<!-- layouts/partials/reading-progress.html -->
{{ $words := .WordCount }}
{{ $wordsPerMinute := 200 }}
{{ $readingTime := div $words $wordsPerMinute }}
{{ $readingTime := cond (lt $readingTime 1) 1 $readingTime }}

<div class="reading-stats">
  <span>{{ $words }} words</span>
  <span>{{ $readingTime }} min read</span>
  <div class="progress-bar" data-reading-time="{{ $readingTime }}">
    <div class="progress" style="width: 0%"></div>
  </div>
</div>
```

**Practical Example: Pagination Math**

```go-html-template
{{ $paginator := .Paginate .Pages }}
{{ $totalPages := $paginator.TotalPages }}
{{ $currentPage := $paginator.PageNumber }}
{{ $progress := mul (div (float $currentPage) (float $totalPages)) 100 }}

<div class="pagination-info">
  <span>Page {{ $currentPage }} of {{ $totalPages }}</span>
  <div class="progress">
    <div style="width: {{ $progress }}%"></div>
  </div>
</div>
```

### Time & Dates

#### Date Formatting

```go-html-template
{{ .Date.Format "January 2, 2006" }}    <!-- November 21, 2025 -->
{{ .Date.Format "2006-01-02" }}         <!-- 2025-11-21 -->
{{ .Date.Format "3:04 PM" }}            <!-- 2:30 PM -->
{{ dateFormat "Monday, Jan 2" .Date }}  <!-- Thursday, Nov 21 -->
```

#### Date Arithmetic

```go-html-template
<!-- Add/subtract time -->
{{ $tomorrow := now.AddDate 0 0 1 }}
{{ $lastWeek := now.AddDate 0 0 -7 }}
{{ $nextMonth := now.AddDate 0 1 0 }}
{{ $lastYear := now.AddDate -1 0 0 }}

<!-- Calculate duration -->
{{ $duration := sub now .Date }}
{{ $days := div $duration.Hours 24 }}
```

**Practical Example: Relative Time Display**

```go-html-template
<!-- layouts/partials/relative-time.html -->
{{ $duration := sub now .Date }}
{{ $hours := $duration.Hours }}
{{ $days := div $hours 24 }}

{{ if lt $hours 1 }}
  <time>just now</time>
{{ else if lt $hours 24 }}
  <time>{{ math.Floor $hours }}h ago</time>
{{ else if lt $days 7 }}
  <time>{{ math.Floor $days }}d ago</time>
{{ else if lt $days 30 }}
  <time>{{ div (math.Floor $days) 7 }}w ago</time>
{{ else }}
  <time>{{ .Date.Format "Jan 2, 2006" }}</time>
{{ end }}
```

**Practical Example: Content Freshness Indicator**

```go-html-template
{{ $daysSinceUpdate := div (sub now .Lastmod).Hours 24 }}

{{ if lt $daysSinceUpdate 30 }}
  <span class="badge badge-fresh">Recently Updated</span>
{{ else if lt $daysSinceUpdate 180 }}
  <span class="badge badge-current">Current</span>
{{ else }}
  <span class="badge badge-dated">May Need Review</span>
  <small>Last updated {{ .Lastmod.Format "Jan 2006" }}</small>
{{ end }}
```

### Resources: Asset Processing

#### Image Processing

```go-html-template
{{ $img := .Resources.Get "hero.jpg" }}

<!-- Resize -->
{{ $thumb := $img.Resize "300x" }}
{{ $fitted := $img.Fill "400x300" }}

<!-- Filters -->
{{ $blurred := $img.Filter (images.GaussianBlur 5) }}
{{ $grayscale := $img.Filter images.Grayscale }}

<!-- Chaining -->
{{ $processed := $img.Resize "800x" |
                  images.Filter (images.Brightness 10) }}
```

**Practical Example: Responsive Images**

```go-html-template
{{ $img := .Resources.Get "featured.jpg" }}
{{ $small := $img.Resize "400x webp" }}
{{ $medium := $img.Resize "800x webp" }}
{{ $large := $img.Resize "1200x webp" }}
{{ $fallback := $img.Resize "800x jpg" }}

<picture>
  <source
    media="(min-width: 1024px)"
    srcset="{{ $large.RelPermalink }}"
    type="image/webp">
  <source
    media="(min-width: 640px)"
    srcset="{{ $medium.RelPermalink }}"
    type="image/webp">
  <source
    srcset="{{ $small.RelPermalink }}"
    type="image/webp">
  <img
    src="{{ $fallback.RelPermalink }}"
    alt="{{ .Title }}"
    width="800"
    height="600"
    loading="lazy">
</picture>
```

#### CSS/JS Processing

```go-html-template
<!-- SCSS to CSS with minification and fingerprinting -->
{{ $css := resources.Get "css/main.scss" }}
{{ $css = $css | toCSS | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}">

<!-- JavaScript bundling -->
{{ $js := resources.Get "js/main.js" }}
{{ $js = $js | js.Build | minify | fingerprint }}
<script src="{{ $js.RelPermalink }}" integrity="{{ $js.Data.Integrity }}" defer></script>
```

#### Remote Resources

```go-html-template
<!-- Get remote resource -->
{{ $remote := resources.GetRemote "https://cdn.example.com/library.js" }}
{{ with $remote }}
  {{ if .Err }}
    <p>Error: {{ .Err }}</p>
  {{ else }}
    <script src="{{ .RelPermalink }}"></script>
  {{ end }}
{{ end }}
```

### URLs: Link Management

**absURL / relURL:**

```go-html-template
{{ "/images/logo.png" | absURL }}
<!-- https://example.com/images/logo.png -->

{{ "/css/style.css" | relURL }}
<!-- /css/style.css -->
```

**urlize:**

```go-html-template
{{ "Hello World!" | urlize }}
<!-- hello-world -->

{{ "Special Characters: @#$" | urlize }}
<!-- special-characters -->
```

**Practical Example: Breadcrumbs**

```go-html-template
<!-- layouts/partials/breadcrumbs.html -->
<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li><a href="{{ .Site.BaseURL }}">Home</a></li>

    {{ $url := "" }}
    {{ range $index, $element := split .RelPermalink "/" }}
      {{ if ne $element "" }}
        {{ $url = printf "%s/%s" $url $element }}
        {{ if eq $index (sub (len (split $.RelPermalink "/")) 2) }}
          <li class="active">{{ replace $element "-" " " | title }}</li>
        {{ else }}
          <li><a href="{{ $url }}">{{ replace $element "-" " " | title }}</a></li>
        {{ end }}
      {{ end }}
    {{ end }}
  </ol>
</nav>
```

## Advanced Patterns

### Pattern 1: Cached Expensive Operations

```go-html-template
<!-- Bad: Processes on every render -->
{{ range .Site.RegularPages }}
  {{ $img := .Resources.Get "hero.jpg" }}
  {{ $processed := $img.Filter (images.GaussianBlur 10) }}
{{ end }}

<!-- Good: Cache with partialCached -->
{{ partialCached "hero-image.html" . .RelPermalink }}

<!-- layouts/partials/hero-image.html -->
{{ $img := .Resources.Get "hero.jpg" }}
{{ $processed := $img.Filter (images.GaussianBlur 10) }}
<img src="{{ $processed.RelPermalink }}" alt="{{ .Title }}">
```

### Pattern 2: Dynamic Component System

```go-html-template
<!-- Front matter -->
---
title: My Page
components:
  - type: hero
    title: Welcome
    image: hero.jpg
  - type: features
    items:
      - name: Fast
      - name: Flexible
  - type: cta
    text: Get Started
---

<!-- Template -->
{{ range .Params.components }}
  {{ partial (printf "components/%s.html" .type) . }}
{{ end }}
```

### Pattern 3: Content Transformation Pipeline

```go-html-template
{{ $content := .RawContent }}

<!-- Custom shortcodes with regex -->
{{ $content = $content | replaceRE `\[note\](.*?)\[/note\]`
  `<aside class="note">$1</aside>` }}
{{ $content = $content | replaceRE `\[warning\](.*?)\[/warning\]`
  `<div class="warning">⚠️ $1</div>` }}
{{ $content = $content | replaceRE `\[tip\](.*?)\[/tip\]`
  `<div class="tip">💡 $1</div>` }}

<!-- Convert to HTML -->
{{ $content = markdownify $content }}

<!-- Output -->
{{ $content | safeHTML }}
```

## Performance Tips

### 1. Filter Before Processing

```go-html-template
<!-- Bad: Process then filter -->
{{ range .Site.Pages | first 100 }}
  {{ if eq .Type "posts" }}
    ...
  {{ end }}
{{ end }}

<!-- Good: Filter then limit -->
{{ range where .Site.Pages "Type" "posts" | first 100 }}
  ...
{{ end }}
```

### 2. Use where Instead of if in Loops

```go-html-template
<!-- Bad -->
{{ range .Site.Pages }}
  {{ if .Params.featured }}
    ...
  {{ end }}
{{ end }}

<!-- Good -->
{{ range where .Site.Pages ".Params.featured" true }}
  ...
{{ end }}
```

### 3. Cache Partials Strategically

```go-html-template
<!-- Cache per language and section -->
{{ partialCached "navigation.html" . .Lang .Section }}

<!-- Cache globally -->
{{ partialCached "footer.html" . }}

<!-- Don't cache dynamic content -->
{{ partial "user-specific-content.html" . }}
```

### 4. Avoid Nested Resources.Get

```go-html-template
<!-- Bad: Multiple file reads -->
{{ range .Pages }}
  {{ $config := resources.Get "data/config.json" }}
{{ end }}

<!-- Good: Get once, pass to partial -->
{{ $config := resources.Get "data/config.json" | transform.Unmarshal }}
{{ range .Pages }}
  {{ partial "item.html" (dict "Page" . "Config" $config) }}
{{ end }}
```

## Conclusion

Hugo's template functions provide a powerful toolkit for building dynamic, performant static sites. By mastering these functions and applying performance best practices, you can create sophisticated websites while maintaining fast build times.

The key is knowing which tool to use for each job and understanding the performance implications of your choices.

## Resources

- [Hugo Functions Documentation](https://gohugo.io/functions/)
- [Go Template Documentation](https://pkg.go.dev/text/template)
- [Hugo Template Primer](https://gohugo.io/templates/introduction/)

---

*This is Part 4 of the Hugo Mastery series. [← Back to Part 3](/posts/hugo-mastery-part-3-latest-features-and-whats-new) | [Back to Part 1 →](/posts/hugo-mastery-part-1-configuration-and-best-practices)*
