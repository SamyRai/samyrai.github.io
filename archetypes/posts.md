---
title = "{{ replace .File.ContentBaseName `-` ` ` | title }}"
date = "{{ .Date }}"
draft = true
[author]
name = "{{ .Site.Params.author }}"
email = ""
tags = []
categories = []
sources = []
[[versions]]
platform = ""
url = ""
posted_at = ""
external_id = ""
note = ""
version_content_files = [] # relative paths inside the post bundle to non-rendered markdown variants, e.g. ["versions/linkedin.md"]
# Example use for cross-posts (fill in after adding `versions/` files):
# version_content_files = ["versions/linkedin.md", "versions/x.md"]
description = ""
summary = ""
[params]
reading_time = true
featured_image = ""
---

Write something memorable — your post will appear in the `posts` section.
