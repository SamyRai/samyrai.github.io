#!/usr/bin/env python3
"""Populate bibliography metadata by querying public research APIs."""

import argparse
import json
import os
import time
import difflib

import requests
from habanero import Crossref, exceptions as habanero_exceptions
from pymed import PubMed
import arxiv


def normalize_text(text):
    """Normalize text for comparison."""
    if not text:
        return ""
    return text.lower().strip()


def title_similarity(title1, title2):
    """Calculate similarity between two titles."""
    return difflib.SequenceMatcher(
        None, normalize_text(title1), normalize_text(title2)
    ).ratio()


def search_crossref(citation):
    """Search CrossRef for citation metadata."""
    cr = Crossref()
    query_parts = []
    if citation.get("title"):
        query_parts.append(citation["title"])
    if citation.get("authors"):
        if isinstance(citation["authors"], list):
            query_parts.extend(citation["authors"])
        else:
            query_parts.append(citation["authors"])
    if citation.get("year"):
        query_parts.append(str(citation["year"]))
    if citation.get("journal"):
        query_parts.append(citation["journal"])

    query = " ".join(query_parts)
    if not query:
        return None

    try:
        results = cr.works(query=query, limit=5)
        if "message" in results and "items" in results["message"]:
            for item in results["message"]["items"]:
                title_list = item.get("title", [""])
                item_title = title_list[0] if title_list else ""
                if (
                    title_similarity(
                        citation.get("title", ""),
                        item_title,
                    )
                    > 0.8
                ):
                    return {
                        "doi": item.get("DOI", ""),
                        "url": (
                            f"https://doi.org/{item.get('DOI')}"
                            if item.get("DOI")
                            else ""
                        ),
                        "volume": item.get("volume", ""),
                        "issue": item.get("issue", ""),
                        "pages": item.get("page", ""),
                        "publisher": item.get("publisher", ""),
                    }
    except habanero_exceptions.Error as exc:
        print(f"CrossRef error: {exc}")
    return None


def search_pubmed(citation):
    """Search PubMed for citation metadata."""
    citation_type = citation.get("type", "")
    if not citation.get("journal") or "journal" not in citation_type:
        return None

    pubmed = PubMed(tool="BibliographyPopulator", email="dummy@example.com")
    query_parts = []
    if citation.get("title"):
        query_parts.append(f'"{citation["title"]}"')
    if citation.get("authors"):
        if isinstance(citation["authors"], list):
            query_parts.extend([f'"{a}"' for a in citation["authors"]])
        else:
            query_parts.append(f'"{citation["authors"]}"')
    if citation.get("year"):
        query_parts.append(str(citation["year"]))

    query = " ".join(query_parts)
    if not query:
        return None

    try:
        results = pubmed.query(query, max_results=5)
    except (requests.RequestException, RuntimeError) as exc:
        print(f"PubMed error: {exc}")
        return None

    for article in results:
        if (
            title_similarity(
                citation.get("title", ""),
                article.title,
            )
            > 0.8
        ):
            return {
                "doi": article.doi or "",
                "url": (article.doi and f"https://doi.org/{article.doi}") or "",
                "volume": "",
                "issue": "",
                "pages": "",
                "publisher": "",
            }
    return None


def search_arxiv(citation):
    """Search arXiv for citation metadata."""
    if citation.get("type") != "journal":
        return None

    query_parts = []
    if citation.get("title"):
        query_parts.append(f'ti:"{citation["title"]}"')
    if citation.get("authors"):
        if isinstance(citation["authors"], list):
            query_parts.extend([f'au:"{a}"' for a in citation["authors"]])
        else:
            query_parts.append(f'au:"{citation["authors"]}"')

    query = " ".join(query_parts)
    if not query:
        return None

    try:
        search = arxiv.Search(query=query, max_results=5)
        results_iter = arxiv.Client().results(search)
    except (arxiv.ArxivError, requests.RequestException) as exc:
        print(f"arXiv error: {exc}")
        return None

    for result in results_iter:
        if title_similarity(citation.get("title", ""), result.title) > 0.8:
            return {
                "doi": result.doi or "",
                "url": result.entry_id or "",
                "volume": "",
                "issue": "",
                "pages": "",
                "publisher": "arXiv",
            }
    return None


def search_semantic_scholar(citation, retry_delay=1.0, max_retries=2):
    """Search Semantic Scholar HTTP API for metadata."""
    title = citation.get("title")
    if not title:
        return None

    api_url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": title,
        "limit": 5,
        "fields": "title,doi,url,venue,publicationVenue,year",
    }
    headers = {}
    api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
    if api_key:
        headers["x-api-key"] = api_key

    for attempt in range(max_retries + 1):
        try:
            response = requests.get(
                api_url,
                params=params,
                headers=headers,
                timeout=5,
            )
            response.raise_for_status()
            break
        except requests.RequestException as exc:
            if attempt < max_retries and "429" in str(exc):
                wait_time = retry_delay * (2**attempt)
                print(f"Semantic Scholar rate limit, " f"retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"Semantic Scholar error: {exc}")
                return None

    data = response.json()
    for paper in data.get("data", []):
        if title_similarity(title, paper.get("title", "")) > 0.8:
            venue = paper.get("publicationVenue") or paper.get("venue") or {}
            return {
                "doi": paper.get("doi", ""),
                "url": paper.get("url", ""),
                "volume": (venue.get("volume", "") if isinstance(venue, dict) else ""),
                "issue": "",
                "pages": "",
                "publisher": (
                    venue.get("publisher", "") if isinstance(venue, dict) else ""
                ),
            }
    return None


def populate_citation(citation):
    """Populate missing fields in a citation."""
    if citation.get("type") == "web" and citation.get("url"):
        return citation  # Already has URL

    sources = [
        search_crossref,
        search_pubmed,
        search_arxiv,
    ]

    for source in sources:
        metadata = source(citation)
        if metadata:
            for key, value in metadata.items():
                if not citation.get(key) and value:
                    citation[key] = value
            break  # Stop after first successful source

    return citation


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--start",
        type=int,
        default=0,
        help="Index to start processing from",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of citations to update",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=1.0,
        help="Delay between API calls to stay polite",
    )
    args = parser.parse_args()

    with open("data/bibliography.json", "r", encoding="utf-8") as handle:
        bibliography = json.load(handle)

    updated: list[dict] = []
    processed = 0
    for idx, citation in enumerate(bibliography):
        if idx < args.start:
            updated.append(citation)
            continue
        if args.limit is not None and processed >= args.limit:
            updated.append(citation)
            continue

        print(
            "Processing ({current}/{total}): {title}".format(
                current=idx + 1,
                total=len(bibliography),
                title=citation.get("title", "No title"),
            )
        )
        updated_citation = populate_citation(citation)
        updated.append(updated_citation)
        processed += 1
        time.sleep(max(args.sleep, 0))

    with open("data/bibliography.json", "w", encoding="utf-8") as handle:
        json.dump(updated, handle, indent=2)

    print(f"Bibliography updated. Processed {processed} record(s).")


if __name__ == "__main__":
    main()
