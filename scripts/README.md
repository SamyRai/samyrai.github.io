# Scripts

This folder contains utility scripts for working with the content repository.

export_bibliography.py

- Extracts front matter `bibliography:` entries and posts "Extra Reading"/"Further Reading" sections.
- Writes a consolidated JSON to `data/bibliography.json`.

Usage:

```bash
# export registry to JSON
python scripts/export_bibliography.py

# include metadata fetch from URLs (optional, requires requests)
python scripts/export_bibliography.py --fetch

# write the extracted bibliography back into front matter (be careful)
python scripts/export_bibliography.py --update-fm
```

Requirements:

- Python 3
- (Optional) requests: for fetching remote page metadata
- (Optional) PyYAML: to parse and write YAML front matter

Flags:

- `--fetch`: Fetch metadata (title/author) from linked URLs.
- `--update-fm`: Write discovered `bibliography` back to the post's front matter.
- `--merge-existing`: Merge discovered bibliography items with the existing `bibliography` in front matter instead of replacing it.
- `--preview`: Show what would be written (counts) without modifying files.
