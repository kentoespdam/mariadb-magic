import sys, json
from graphify.extract import collect_files, extract
from pathlib import Path

with open('graphify-out/.graphify_incremental.json') as f:
    result = json.load(f)

code_files = []
for f in result.get('new_files', {}).get('code', []):
    p = Path(f)
    if p.is_dir():
        code_files.extend(collect_files(p))
    else:
        code_files.append(p)

if code_files:
    res = extract(code_files, cache_root=Path('.'))
    with open('graphify-out/.graphify_ast.json', 'w') as out:
        json.dump(res, out, indent=2)
    print(f"AST: {len(res.get('nodes', []))} nodes, {len(res.get('edges', []))} edges")
else:
    with open('graphify-out/.graphify_ast.json', 'w') as out:
        json.dump({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}, out, indent=2)
    print('No code files - skipping AST extraction')
