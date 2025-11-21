#!/usr/bin/env python3
"""
Export bibliography registry for Hugo posts.

This script collects:
 - front-matter `bibliography:` entries
 - links under sections such as "Extra Reading", "Further Reading", "References",
     and "Bibliography" and writes a consolidated JSON to
     `data/bibliography.json`.

Optional features:
- --fetch: try to fetch remote pages to extract title/meta author
 - --update-fm: write extracted structured bibliography back to post
     front matter

Usage:
  python scripts/export_bibliography.py --output data/bibliography.json

"""

import re
import json
import glob
import argparse
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

try:
    import requests
except ImportError:
    requests = None

# Patterns
LINK_RE = re.compile(r"\[([^\]]+)\]\(\s*<?(https?://[^)\s>]+)>?\s*\)")
RAW_URL_RE = re.compile(r"(https?://[^)\s>]+)")
NUM_TITLE_RE = re.compile(
    r"^(?:\d+\.|- |\*\-)\s*"
    r'(?:\*\*)?"?([^"\*]+)"?(?:\*\*)?'
    r"(?:\s+by\s+([^\n]+))?",
    flags=re.I,
)

SECTIONS = [
    "Extra Reading",
    "Extra Reading:",
    "Further Reading",
    "References",
    "Bibliography",
]


def read_front_matter(text):
    if not text.startswith("---"):
        return None, text
    end = text.find("\n---", 3)
    if end == -1:
        return None, text
    fm_text = text[3:end]
    body = text[end + 4 :]
    if yaml:
        try:
            data = yaml.safe_load(fm_text)
            return data or {}, body
        except Exception as err:
            # If it's a YAML parsing error, ignore and fallback to
            # a simple parser. Re-raise unexpected errors.
            if not hasattr(yaml, "YAMLError") or not isinstance(err, yaml.YAMLError):
                raise
    # Simple parse for key: value pairs
    data = {}
    for line in fm_text.splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            k = k.strip()
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                # try to parse list
                items = [
                    x.strip().strip("\"'")
                    for x in v.strip("[]").split(",")
                    if x.strip()
                ]
                data[k] = items
            else:
                data[k] = v.strip('"').strip("'")
    return data, body


def extract_bibliography_from_fm(frontmatter):
    if not frontmatter:
        return []
    bib = frontmatter.get("bibliography")
    if not bib:
        return []
    return bib


def extract_links_from_sections(text):
    # Find headings like '## Extra Reading' and capture section until next '##'
    results = []
    header_re = r"^(#{2,6})\s*(%s)\s*$" % ("|".join(re.escape(s) for s in SECTIONS))
    for m in re.finditer(header_re, text, flags=re.I | re.M):
        start = m.end()
        # find next heading with same or higher level
        cur_level = len(m.group(1))
        pattern = r"^#{1,%d}\s" % cur_level
        nxt = re.search(pattern, text[start:], flags=re.M)
        end = nxt.start() + start if nxt else len(text)
        sec = text[start:end]
        results.append(sec.strip())
    # fallback small headings
    if not results:
        header_re2 = r"^(#{3,6})\s*(%s)\s*$" % (
            "|".join(re.escape(s) for s in SECTIONS)
        )
        for m in re.finditer(header_re2, text, flags=re.I | re.M):
            start = m.end()
            nxt = re.search(r"^#{3,6}\s", text[start:], flags=re.M)
            end = nxt.start() + start if nxt else len(text)
            sec = text[start:end]
            results.append(sec.strip())

    entries = []
    for sec in results:
        for line in sec.splitlines():
            line = line.strip()
            if not line:
                continue
            for lm in LINK_RE.finditer(line):
                title = lm.group(1).strip()
                url = lm.group(2).strip()
                # normalize url: strip angle bracket, trailing punctuation, and
                # stray arrows
                url = url.rstrip(">).,;\"'\n\t ").rstrip("->")
                entries.append(
                    {
                        "type": "web",
                        "title": title,
                        "url": url,
                        "authors": "",
                        "year": "",
                    }
                )
            # If no markdown link, try raw url — but only if the line looks
            # like a list item (numbered or bullet) or starts with a URL.
            if not LINK_RE.search(line):
                if not re.match(r"^(?:\d+\.|\-|\* )|https?://", line):
                    continue
                mu = RAW_URL_RE.search(line)
                if mu:
                    url = mu.group(1).strip()
                    url = url.rstrip(">).,;\"'\n\t ").rstrip("->")
                    # guess title from text
                    t = re.sub(r"https?://[^\s]+", "", line).strip()
                    # Limit noisy titles (avoid capturing whole paragraphs)
                    t = t.strip()
                    if len(t) > 180:
                        t = url
                    title = t or url
                    entries.append(
                        {
                            "type": "web",
                            "title": title,
                            "url": url,
                            "authors": "",
                            "year": "",
                        }
                    )
                else:
                    # Try numbered/bullet list (book titles)
                    mnum = NUM_TITLE_RE.match(line)
                    if mnum:
                        title = mnum.group(1).strip()
                        authors = (mnum.group(2) or "").strip()
                        entries.append(
                            {
                                "type": "book",
                                "title": title,
                                "authors": authors,
                                "url": "",
                                "year": "",
                            }
                        )
    return entries


def fetch_metadata_for_url(url):
    # Simple fetch: title from <title> tag, meta authors/description
    if not requests:
        return {}
    try:
        r = requests.get(
            url,
            timeout=10,
            headers={"User-Agent": "Mozilla/5.0"},
        )
        if r.status_code != 200:
            return {}
        text = r.text
        # Title
        m = re.search(r"<title>(.*?)<\/title>", text, flags=re.I | re.S)
        title = m.group(1).strip() if m else ""
        # meta author or site
        m2 = re.search(
            r'<meta\s+name=["\']author["\']\s+content=["\'](.*?)["\']',
            text,
            flags=re.I,
        )
        author = m2.group(1).strip() if m2 else ""
        return {"title": title, "authors": author}
    except requests.RequestException:
        return {}


def build_registry(
    posts_pattern="content/en/posts/*.md",
    out="data/bibliography.json",
    fetch=False,
    update_fm=False,
    merge_existing=False,
    preview=False,
):
    posts = sorted(glob.glob(posts_pattern))
    reg = {}
    for p in posts:
        pth = Path(p)
        text = pth.read_text(encoding="utf-8")
        fm, body = read_front_matter(text)
        biblio = extract_bibliography_from_fm(fm)
        # normalize: ensure list of dicts
        if biblio and isinstance(biblio, list):
            ent = biblio[:]
        else:
            ent = []
        # parse body sections
        extra = extract_links_from_sections(body)
        # add extra ones not already in ent
        existing_urls = {e.get("url") for e in ent if e.get("url")}
        for e in extra:
            if e.get("url") and e["url"] in existing_urls:
                continue
            ent.append(e)
            existing_urls.add(e.get("url"))
        # optionally fetch metadata
        if fetch:
            for e in ent:
                if e.get("url") and (
                    not e.get("title")
                    or e["title"].startswith("http")
                    or e["title"] == ""
                ):
                    m = fetch_metadata_for_url(e["url"])
                    if m.get("title"):
                        e["title"] = m["title"]
                    if m.get("authors"):
                        e["authors"] = m["authors"]
        reg[pth.name] = ent

        # update front matter if requested — simple YAML insertion
        if update_fm and not fm:
            fm = {}
        # optional merging behavior: don't wipe curated bibliography
        if update_fm and ent:
            if merge_existing and fm and fm.get("bibliography"):
                # merge while preserving existing entries' richer metadata
                old = fm.get("bibliography") or []
                merged = merge_bibliographies(old, ent)
                fm["bibliography"] = merged
                if preview:
                    msg = (
                        f"[PREVIEW] {pth.name}: existing={len(old)} "
                        f"found={len(ent)} "
                        f"merged={len(fm.get('bibliography'))}"
                    )
                    print(msg)
            else:
                fm["bibliography"] = ent
            # write back
            fm_text = (
                yaml.safe_dump(fm, sort_keys=False)
                if yaml
                else "\n".join(f"{k}: {v}" for k, v in fm.items())
            )
            new_text = (
                "---\n"
                + (fm_text if isinstance(fm_text, str) else str(fm_text))
                + "---\n"
                + body
            )
            if not preview:
                pth.write_text(new_text, encoding="utf-8")

    # write JSON
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    Path(out).write_text(
        json.dumps(reg, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return reg


def merge_bibliographies(old_list, new_list):
    """Merge two bibliography lists without dropping existing metadata.

    Strategy:
    - Keep order of `old_list` first.
    - Add new entries from `new_list` that are not present by `url` or `title`.
    - If url matches, prefer non-empty fields from old_list.
    """
    merged = []
    seen_urls = set()
    seen_titles = set()

    # helper removed (was unused)

    # seed with old
    for e in old_list:
        merged.append(e)
        if e.get("url"):
            seen_urls.add(e.get("url"))
        if e.get("title"):
            seen_titles.add(e.get("title").strip().lower())

    # add new ones not present
    for e in new_list:
        url = e.get("url")
        title = (e.get("title") or "").strip().lower()
        if url and url in seen_urls:
            # merge metadata into existing entry
            for old in merged:
                if old.get("url") == url:
                    # prefer old non-empty fields, but add missing ones
                    for k, v in e.items():
                        if not old.get(k) and v:
                            old[k] = v
                    break
            continue
        if title and title in seen_titles:
            # title-only match, attempt to merge
            for old in merged:
                old_title = old.get("title")
                if old_title and old_title.strip().lower() == title:
                    for k, v in e.items():
                        if not old.get(k) and v:
                            old[k] = v
                    break
            continue
        merged.append(e)

    return merged


def main():
    parser = argparse.ArgumentParser(
        description="Export bibliographies to JSON",
    )
    parser.add_argument(
        "--posts", default="content/en/posts/*.md", help="Glob to posts"
    )
    parser.add_argument(
        "--out", default="data/bibliography.json", help="Output JSON path"
    )
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="Fetch metadata from URLs",
    )
    parser.add_argument(
        "--update-fm",
        action="store_true",
        help="Write bibliography into front matter",
    )
    parser.add_argument(
        "--merge-existing",
        action="store_true",
        help=(
            "If writing to front matter, merge with existing bibliography "
            "entries instead of replacing"
        ),
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help=(
            "Don't write back changes; just show counts of found vs "
            "existing bibliography entries"
        ),
    )
    args = parser.parse_args()
    reg = build_registry(
        posts_pattern=args.posts,
        out=args.out,
        fetch=args.fetch,
        update_fm=(args.update_fm and not args.preview),
        merge_existing=args.merge_existing,
        preview=args.preview,
    )
    if args.preview and args.update_fm:
        print(
            "Preview mode: no files were modified. Use --update-fm to" " write changes."
        )
    print(f"Wrote registry for {len(reg)} files to {args.out}")


if __name__ == "__main__":
    main()
