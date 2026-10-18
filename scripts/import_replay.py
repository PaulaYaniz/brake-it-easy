"""Build four coordinate-free demo excerpts from Nazirkar's two original trips.

Source: https://doi.org/10.17632/5stn873wft.1 (CC BY 4.0)
Usage: python3 scripts/import_replay.py /path/to/extracted-dataset

Each CSV is split once at its midpoint. The four cases are distinct,
nonoverlapping excerpts, not four independently recorded journeys.
"""

import csv
import json
import statistics
import sys
from collections import defaultdict
from pathlib import Path


FILES = ("1_20210317_184512.csv", "2_20210317_171452.csv")


def seconds(value: str) -> int:
    hour, minute, second = map(int, value.split("-"))
    return hour * 3600 + minute * 60 + second


def clock(value: int) -> str:
    return f"{value // 3600:02d}:{value // 60 % 60:02d}:{value % 60:02d}"


def read_seconds(path: Path) -> list[dict]:
    groups: dict[int, list[dict[str, str]]] = defaultdict(list)
    with path.open(newline="") as csv_file:
        for row in csv.DictReader(csv_file):
            groups[seconds(row["Time"])].append(row)

    samples = []
    for second, rows in sorted(groups.items()):
        def median(key: str) -> float:
            return statistics.median(float(row[key]) for row in rows)

        # The source does not document units. Android speed and distance field
        # conventions suggest m/s and metres; the UI labels this inference.
        samples.append({
            "clockSecond": second,
            "speed": round(median("Speed"), 3),
            "distance": median("Distance"),
            "motion": round(max((float(row["Acc X"]) ** 2 + float(row["Acc Y"]) ** 2 + float(row["Acc Z"]) ** 2) ** 0.5 for row in rows), 3),
            "readingCount": len(rows),
        })
    return samples


def excerpt(samples: list[dict], filename: str, number: int) -> dict:
    start = samples[0]["clockSecond"]
    baseline = samples[0]["distance"]
    running_distance = 0.0
    points = []
    for sample in samples:
        # The source distance has small backwards jitter. Keep its cumulative trend.
        running_distance = max(running_distance, sample["distance"] - baseline)
        points.append({
            "t": sample["clockSecond"] - start,
            "speed": sample["speed"],
            "distance": round(running_distance, 1),
            "motion": sample["motion"],
        })
    return {
        "case": number,
        "sourceFile": filename,
        "sourceWindow": f"{clock(start)}–{clock(samples[-1]['clockSecond'])}",
        "originalReadingCount": sum(sample["readingCount"] for sample in samples),
        "points": points,
    }


source_dir = Path(sys.argv[1])
cases = []
for filename in FILES:
    source = read_seconds(source_dir / filename)
    midpoint = len(source) // 2
    for segment in (source[:midpoint], source[midpoint:]):
        cases.append(excerpt(segment, filename, len(cases) + 1))

destination = Path(__file__).resolve().parents[1] / "src" / "data" / "nazirkar_cases.json"
destination.write_text(json.dumps(cases, separators=(",", ":")))
for case in cases:
    points = case["points"]
    print(f"Case {case['case']}: {case['sourceFile']} {case['sourceWindow']}, {len(points)} seconds, {points[-1]['distance']} m")
print(f"Wrote {destination}")
