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

vectors = [
    ('movement',9,(200,80,240,130)), ('swords',9,(150,390,194,424)),
    ('fans',14,(488,590,504,610)), ('power',9,(83,580,102,600)),
    ('ability-orange',9,(22,350,62,385)), ('ability-white',9,(67,350,108,385)),
    ('ability-yellow',9,(115,350,149,385)), ('ability-purple',9,(155,350,188,385)),
    ('ability-brown',9,(22,390,62,424)), ('ability-blue',9,(69,390,108,424)),
    ('ability-green',9,(115,390,145,424)),
]
for name, page_number, region in vectors:
    page = doc[page_number-1]
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
            elif kind=='re':
                r=item[1]
                commands.append(f'M {r.x0} {r.y0} L {r.x1} {r.y0} L {r.x1} {r.y1} L {r.x0} {r.y1} Z')
                previous=None
            else: raise ValueError(f'Unexpected vector command: {kind}')
        if p['closePath']: commands.append('Z')
        color='#'+''.join(f'{round(c*255):02x}' for c in p['fill'])
        rule='evenodd' if p['even_odd'] else 'nonzero'
        elements.append(f'<path d="{" ".join(commands)}" fill="{color}" fill-rule="{rule}"/>')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{bounds.x0} {bounds.y0} {bounds.width} {bounds.height}">{"".join(elements)}</svg>'
    (output/(name+'.svg')).write_text(svg,encoding='utf-8')
    manifest.append(dict(file=name+'.svg',source=source.name,page=page_number,bounds=list(bounds),type='original vector paths'))
(output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(f'Extracted {len(manifest)} original transparent icons.')
