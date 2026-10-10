"""Extract original PDF vectors and embedded images; no redraw or AI assets.
Usage: python scripts/extract_icons.py path/to/Cubitos_BaseGame_Rulebook-lowrez.pdf
Requires PyMuPDF. Outputs transparent SVG/PNG plus source manifest.
"""
from pathlib import Path
import sys, json
import pymupdf as fitz

source = Path(sys.argv[1])
doc = fitz.open(source)
page = doc[8]
output = Path(__file__).resolve().parent.parent / 'assets/icons'
output.mkdir(parents=True, exist_ok=True)
manifest = []
for name, xref, mask in [('money',1096,1095),('credit',1126,1127)]:
    pix = fitz.Pixmap(doc, xref)
    if pix.colorspace.n != 3: pix = fitz.Pixmap(fitz.csRGB, pix)
    alpha = fitz.Pixmap(doc, mask)
    alpha = fitz.Pixmap(alpha, pix.width, pix.height)
    pix = fitz.Pixmap(pix, alpha)
    pix.save(output / (name+'.png'))
    manifest.append(dict(file=name+'.png',source=source.name,page=9,xref=xref,mask=mask))

for name, region in [('movement',(200,80,240,130)),('swords',(150,390,194,424))]:
    paths = [p for p in page.get_drawings() if fitz.Rect(region).contains(p['rect']) and p['fill'] is not None]
    assert paths
    bounds=fitz.Rect(paths[0]['rect'])
    for p in paths: bounds |= p['rect']
    bounds += (-1,-1,1,1)
    elements=[]
    for p in paths:
        commands=[]
        previous=None
        for item in p['items']:
            kind=item[0]
            if kind in ['l','c']:
                start=item[1]
                if previous != start: commands.append(f'M {start.x} {start.y}')
                if kind=='l': commands.append(f'L {item[2].x} {item[2].y}')
                else: commands.append('C '+' '.join(f'{q.x} {q.y}' for q in item[2:]))
                previous=item[-1]
            else: raise ValueError(f'Unexpected vector command: {kind}')
        if p['closePath']: commands.append('Z')
        color='#'+''.join(f'{round(c*255):02x}' for c in p['fill'])
        rule='evenodd' if p['even_odd'] else 'nonzero'
        elements.append(f'<path d="{" ".join(commands)}" fill="{color}" fill-rule="{rule}"/>')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{bounds.x0} {bounds.y0} {bounds.width} {bounds.height}">{"".join(elements)}</svg>'
    (output/(name+'.svg')).write_text(svg,encoding='utf-8')
    manifest.append(dict(file=name+'.svg',source=source.name,page=9,bounds=list(bounds),type='original vector paths'))
(output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('Extracted 4 original transparent icons.')
