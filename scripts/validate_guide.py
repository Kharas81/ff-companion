#!/usr/bin/env python3
"""Validate the public FF Companion JSON files without third-party packages."""
import json,re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
errors=[]
def err(message):errors.append(message)
def read(p):
    try:return json.loads((ROOT/p).read_text(encoding='utf8'))
    except Exception as exc:err(f"{p}: {exc}");return None
manifest=read('data/manifest.json')
if not manifest:sys.exit(1)
allowed={'story','preparation','chest','bestiary','boss','key-item','misc','jobs','blue-magic','summons','minigames'}
expected={12:'Garland',17:'Pirate',24:'Ghast',32:'Piscodemon',33:'Astos'}
files=[]; keys=set(); references=[]; numbers={}
for game in manifest['games']:
 for path in game.get('chapterFiles',[]):
    if path in files:err(f'duplicate manifest path: {path}')
    files.append(path)
    if not re.fullmatch(r'data/[a-z0-9-]+/chapter-[0-9]+.json',path):err(f'invalid chapter path: {path}')
    d=read(path)
    if not d:continue
    if d.get('format')!='ff-companion-chapter' or d.get('schemaVersion')!=1 or d.get('gameId')!=game['id']:err(f'invalid document header: {path}')
    ch=d.get('chapter',{});seen=set()
    for section in ch.get('sections',[]):
       sid=section.get('id')
       if not sid or sid in seen:err(f'duplicate/empty section id: {path}:{sid}')
       seen.add(sid)
       if not isinstance(section.get('steps'),list):err(f'bad steps: {path}:{sid}')
       checks=set()
       for item in section.get('checks',[]):
          ident=item.get('id')
          if not ident or ident in checks:err(f'duplicate/empty task id: {path}:{sid}:{ident}')
          checks.add(ident)
          key=f"{game['id']}/{ch.get('id')}/{sid}/{ident}"
          if key in keys:err(f'duplicate global key: {key}')
          keys.add(key)
          if item.get('category') not in allowed:err(f'unknown category: {key}')
          if item.get('referenceTo'):references.append((key,item['referenceTo']))
          if game['id']=='ff1-pr' and item.get('category')=='bestiary':
              m=re.match(r'#(\d+)\s+(.+)',item.get('title',''))
              if m and not item.get('referenceTo'):
                 number=int(m.group(1));name=m.group(2)
                 if number in numbers and numbers[number][0]!=name:err(f'conflicting bestiary #{number}: {numbers[number]} vs {name}')
                 numbers[number]=(name,key)
          if item.get('requiredFor100') not in (True,False,None):err(f'bad requiredFor100: {key}')
       if not isinstance(section.get('checks'),list):err(f'bad checks: {path}:{sid}')
    if not ch.get('sections'):err(f'empty chapter: {path}')
for a,b in references:
 if b not in keys:err(f'broken reference: {a} -> {b}')
for n,name in expected.items():
 if n in numbers and numbers[n][0].lower()!=name.lower():err(f'wrong bestiary #{n}: {numbers[n][0]} vs {name}')
ff1=[read(p) for p in files if p.startswith('data/ff1/')]
if len(ff1)>=5:
 chests=[sum(1 for s in x['chapter']['sections'] for c in s['checks'] if c['category']=='chest') for x in ff1[:5]]
 if chests != [3,3,15,0,29]:err(f'wrong chapter 1–5 chest allocation: {chests} (expected [3,3,15,0,29])')
 print('FF I chapters 1–5 chest distribution:',chests)
print('Validated files:',len(files),'tasks:',len(keys),'references:',len(references))
if errors:
 for e in errors:print('ERROR:',e,file=sys.stderr)
 sys.exit(1)
print('All automated checks passed.')
