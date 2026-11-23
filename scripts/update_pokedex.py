#!/usr/bin/env python3
"""Incrementally add basic Pokédex metadata. Never invents game-specific guides."""
import json
import os
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
PATH = BASE / "data" / "pokemon.json"
LIMIT = min(max(int(os.getenv("BATCH_SIZE", "5")), 1), 20)
MAX_ID = int(os.getenv("MAX_POKEMON_ID", "1025"))

def fetch_json(url):
    request = urllib.request.Request(url, headers={"User-Agent": "PokeVerseCommunityDex/0.1"})
    with urllib.request.urlopen(request, timeout=18) as response:
        return json.load(response)

def main():
    document = json.loads(PATH.read_text(encoding="utf-8"))
    current = {entry["id"]: entry for entry in document["pokemon"]}
    added = 0
    for identifier in range(1, MAX_ID + 1):
        if added >= LIMIT:
            break
        if identifier in current:
            continue
        try:
            pokemon = fetch_json(f"https://pokeapi.co/api/v2/pokemon/{identifier}/")
            species = fetch_json(f"https://pokeapi.co/api/v2/pokemon-species/{identifier}/")
            chinese = next((entry["name"] for entry in species["names"] if entry["language"]["name"] == "zh-Hant"), None)
            english = next((entry["name"] for entry in species["names"] if entry["language"]["name"] == "en"), pokemon["name"].title())
            current[identifier] = {
                "id": identifier,
                "name_zh": chinese or english,
                "name_en": english,
                "types": [entry["type"]["name"] for entry in sorted(pokemon["types"], key=lambda entry: entry["slot"])],
                "updated_at": datetime.now(timezone.utc).date().isoformat(),
            }
            added += 1
            print(f"Added #{identifier}: {english}")
        except Exception as error:
            print(f"Skipping #{identifier}: {error}")
        time.sleep(0.25)
    if added:
        document["pokemon"] = sorted(current.values(), key=lambda entry: entry["id"])
        document["updated_at"] = datetime.now(timezone.utc).date().isoformat()
        PATH.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Added {added}; total {len(current)}")

if __name__ == "__main__":
    main()
