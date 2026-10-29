#!/usr/bin/env python3
import json, sys, pathlib, re
root = pathlib.Path(__file__).resolve().parent
def ref(n): return json.loads((root/n).read_text(encoding="utf-8"))
identity = ref("companion-identity.json")
if len(sys.argv) != 2:
    print("Usage: python validate.py path/to/chapter-01.json")
    sys.exit(2)
errors, warnings = [], []
try:
    data = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
except Exception as e:
    print("FAIL: invalid JSON:", e)
    sys.exit(2)
if data.get("format") != "ff-companion-chapter": errors.append("invalid format")
if data.get("schemaVersion") != 1: errors.append("schemaVersion must be 1")
if data.get("gameId") != identity["gameId"]: errors.append("gameId mismatch")
chapter = data.get("chapter") or {}
if chapter.get("id") != identity["chapterId"]: errors.append("chapter ID mismatch")
if chapter.get("contentStatus") not in ("needs-review", "verified", None): errors.append("unsupported contentStatus")
original = {(s["id"], t) for s in identity["sections"] for t in s["taskIds"]}
seen = set()
sections = chapter.get("sections")
if not isinstance(sections, list): errors.append("sections must be a list"); sections = []
for section in sections:
    if not isinstance(section, dict): errors.append("invalid section"); continue
    sid = section.get("id")
    if not isinstance(sid, str): errors.append("invalid section ID"); continue
    if not isinstance(section.get("steps"), list) or not isinstance(section.get("checks"), list):
        errors.append("invalid steps/checks in " + sid); continue
    for task in section["checks"]:
        if not isinstance(task, dict): errors.append("invalid task"); continue
        tid = task.get("id")
        if not isinstance(tid, str): errors.append("invalid task ID"); continue
        key = (sid, tid)
        if key in seen: errors.append("duplicate task: " + repr(key))
        seen.add(key)
        if task.get("category") not in identity["allowedCategories"]: errors.append("invalid category: " + repr(key))
        if "priority" in task and task["priority"] not in identity["allowedPriorities"]: errors.append("invalid priority: " + repr(key))
        if "available" in task and task["available"] not in identity["availableValues"]: errors.append("invalid available: " + repr(key))
        for field in ("missable", "requiredFor100"):
            if field in task and not isinstance(task[field], bool): errors.append("invalid "+field+": "+repr(key))
        if "referenceTo" in task: warnings.append("referenceTo not resolved: " + repr(key))
    for step in section["steps"]:
        if re.search(r"\\b(?:100|80|10)\\s*Gil\\b", str(step), flags=re.I):
            warnings.append("Review exact price in: " + str(step)[:100])
missing = original - seen
if missing: errors.append("MISSING ORIGINAL TASK KEYS: " + repr(sorted(missing)))
print("SCHEMA/ID:", "FAIL" if errors else "PASS (STRUCTURAL ONLY)")
print("Original keys:", len(original), "preserved:", len(original & seen), "new:", len(seen-original))
print("Game facts / gameplay narrative: NOT RUN; manual source check required")
for x in errors: print("ERROR:",x)
for x in warnings: print("WARNING:",x)
sys.exit(1 if errors else 0)
