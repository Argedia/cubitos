"""Extract the supplied Spanish reference and original PDF illustrations.
Usage: python scripts/extract_content.py [directory containing PDFs]
Requires PyMuPDF and Pillow. No Python dependency at runtime.
"""
from pathlib import Path
import sys, json, re, unicodedata
import pymupdf as fitz

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT
TRANSLATION = 'Cubitos_Traduccion_cartas.pdf'
RULEBOOK = 'Cubitos_BaseGame_Rulebook_Optimized.pdf'
colors = {'Rojo':'red','Naranja':'orange','Amarillo':'yellow','Verde':'green','Azul':'blue','Morado':'purple','Café':'brown','Blanco':'white'}
summaries = {
 'Dugout':'Ahora: tira 3 dados de tu zona de robo y lleva los éxitos a la zona activa.',
 'Batter Beaver':'Ahora: tira 2 dados de robo. Al correr, si ganaste créditos esta ronda, pierdes un dado.',
 'Reliever Beaver':'Al correr, puedes perder un dado de tu zona de tirar.',
 'Benchwarmer':'Al correr, puedes perder este dado y otro dado cualquiera.',
 'The Babe':'Gana 5 monedas. Con el símbolo especial, también 1 movimiento y pierdes este dado.',
 'Pinch Eater':'Ahora: pasa un dado de la zona de tirar a la activa con el resultado que elijas.',
 'Mr. Bats':'Gana 2 monedas o créditos iguales a la mitad de tus fans, redondeando hacia abajo.',
 'Smelly Cat':'Al correr, gana 2 movimientos.',
 'Fast Cat':'Ahora: tira 2 dados de tu zona de robo y lleva los éxitos a la zona activa.',
 'Cat Tastrophy':'Al correr, gana un dado cuyo precio no supere tu número de fans.',
 'Schmutz':'Gana 1 movimiento. Si perdiste un dado esta ronda, gana también 3 créditos después de moverte.',
 'Broken Cow':'Usa 2 símbolos juntos: gana temporalmente un dado con el resultado que elijas. Lo pierdes al final de la ronda.',
 'Fat Cat':'Al correr, gana 1 moneda, 3 movimientos y un dado gris si queda alguno disponible.',
 'Dope Cat':'Con un dado café activo, gana 2 monedas; con uno verde, gana 3. Puedes obtener ambos beneficios.',
 'Reckless Cheese':'Cada vez que presionas sin fallar, gana y usa inmediatamente 1 movimiento.',
 'The Cheese Stands Alone':'Ahora: debes presionar al menos una vez. Al correr, gana 3 movimientos.',
 'The Big Cheese':'Gana 1 movimiento o tantos como la mitad de tus fans, redondeando hacia abajo.',
 'Ledercheesen':'Tras presionar sin fallar, tira un dado de robo. El símbolo especial da 1 movimiento por cada 4 dados activos al correr.',
 'Bad Cheese':'Gana 2 movimientos. Con el símbolo especial, también 3 monedas y pierdes este dado.',
 'Cheese Boy':'Con un dado café activo: 2 movimientos. Con uno naranja: puedes perder un dado de la zona de tirar.',
 'Stinky Cheese':'Gana 2 movimientos. Con el símbolo especial, los grises no cuentan para tu límite de robo en la próxima ronda.',
 'Mr. Soldier':'Con más espadas: 3 créditos y 2 movimientos; pierdes un dado rojo. El jugador inicial rompe empates.',
 'Punch Guy':'Con más espadas, blancos y verdes no cuentan para el límite de robo de la próxima ronda; pierdes un dado rojo.',
 'Crabby':'El símbolo especial vale 2 espadas. Con más espadas, entrega un dado a quien tenga menos y pierde uno rojo.',
 'Supah General!':'Con más espadas, sin desempate: tantos movimientos como fans; pierdes un dado rojo.',
 'Champion':'Con más espadas, sin desempate: puedes robar todos tus dados en la próxima ronda; pierdes un dado.',
 'El Bandito':'Gana 1 crédito por cada rival con menos espadas. El símbolo especial vale 2 espadas.',
 'Jaques Couteau':'Por cada rival con menos espadas, tira 2 dados tuyos no rojos de cualquier zona. El símbolo especial vale 2 espadas.',
 'Rollosaurus':'Al correr, gana 4 movimientos.',
 'Shimmy Shimmy Dino':'Al correr, gana 1 movimiento por cada dado blanco o gris activo.',
 'Dancing Dino':'Gana 2 movimientos, más 2 si tienes un dado rojo activo y 1 si tienes uno naranja.',
 'Cubasaurus':'Ahora: toma un dado temporal y elige su resultado. Al correr: 4 movimientos y pierdes este dado.',
 'You Bet Jurassican':'Gana 2 movimientos, más 2 con un dado café activo y 1 con uno amarillo.',
 'Pronto Bronto':'Gana 2 movimientos por cada grupo de 3 líneas rojas que te separen de la meta.',
 'Wikiwiki Dinosaur':'Gana 1 movimiento por cada color diferente de dado en tu zona activa.',
 'Rich Dog':'Al correr, gana 3 monedas y pierde este dado; perderlo es obligatorio.',
 'Mr. Dog':'Al correr, gana 2 créditos y pierde este dado; perderlo es obligatorio.',
 'Captain Bark':'Con blanco y rojo activos, gana 1 fan sin créditos. También puedes ganar 2 créditos; pierdes este dado.',
 'Wizard':'Cada vez que presionas sin fallar, gana 1 crédito. Al correr, pierdes este dado obligatoriamente.',
 'Dr. Livingstone':'Al correr, gana 2 movimientos y pierde este dado obligatoriamente.',
 'Dapper Doggie':'Repite las monedas y movimientos de tus grises activos; pierdes este dado obligatoriamente.',
 'Muggles':'Ahora: tira 2 dados de robo. Al correr: 2 monedas y pierdes este dado obligatoriamente.',
 'Bob':'Tras moverte, gana el premio de una casilla a 1 o 2 espacios de distancia.',
 'Stogie':'Ahora: tira todos los dados grises y blancos de tus zonas de robo y tirar.',
 'Undercover Fish':'Al correr, gana 2 movimientos que permiten entrar en el agua.',
 'Llama-Rama':'Gana 3 monedas. Con el símbolo especial, también 1 fan, sin créditos por avanzar.',
 'Llama Shaman':'Al correr, gana 2 monedas y un dado rojo de la reserva.',
 'Chilly McChillster':'Al correr, gana 2 monedas y tira dos veces los dados de tu zona de tirar.',
 'Bahama Llama':'Gana 3 monedas y 1 movimiento que permite entrar en el agua.',
 'Rock On':'Antes de presionar, puedes devolver este dado activo a la zona de tirar para incluirlo en la tirada.',
 'Rolling Stoned':'Si fueras a fallar al presionar, usa este dado y tira tus grises. Con algún éxito, evitas el fallo.',
 'Piña Cubelada':'Usa este dado activo: no puedes fallar la próxima vez que presiones esta ronda.',
 "Keep On Rollin'":'Si fueras a fallar, puedes perder este dado para evitar el fallo.',
 'Up to 11':'Antes de presionar, puedes volver a tirar este dado. Al correr, su símbolo especial duplica tus espadas.',
 'Punk Fruit':'Al fallar, conserva grises y verdes activos. Si fallaste esta ronda, usa este dado para tirar hasta 9 colores distintos.',
 'Pineapple Rocks':'Antes de presionar, devuelve este dado a la zona de tirar. Con el símbolo especial, también otro dado activo.',
}
notes = {
 'Shimmy Shimmy Dino': 'El reglamento (p. 16) indica dados blancos y grises, tanto claros como oscuros. La hoja traducida dice verdes; aquí se usa la aclaración del reglamento.',
 'Up to 11': 'El reglamento (p. 15) permite mover el dado antes de tirar, no antes de fallar como dice la hoja traducida.',
 'Reckless Cheese': 'Este movimiento ocurre durante Tirar: no activa premios ni efectos de movimiento, que solo se usan en el paso Mover (reglamento, p. 15).',
 'Dugout': 'Es una tirada adicional, no presionar: no puedes fallar en esta tirada. Si faltan dados en Robo, pasa primero el Descarte a Robo (p. 14).',
 'Batter Beaver': 'La pérdida al correr cuenta los créditos de cualquier origen durante la ronda. Si fallas en Tirar, este dado pasa al Descarte y no se resuelve su habilidad Correr (p. 14).',
 'Wikiwiki Dinosaur': 'Gris claro y gris oscuro cuentan como un solo color. El dado de jugador inicial sí cuenta como un color propio (p. 16).',
 'Pronto Bronto': 'Calcula todos los movimientos antes de mover la figura. En carreras de varias vueltas, cuenta solo las líneas de la vuelta actual (p. 16).',
 'Bob': 'Resuelve después de Mover y antes de Comprar. No puedes obtener el premio de la casilla donde acabaste; varios dados pueden obtener el mismo premio (p. 16).',
 'Crabby': 'Si varias personas empatan por menos espadas, quien usa la habilidad elige a cuál dar el dado. El receptor lo coloca en Descarte (p. 14).',
 'El Bandito': 'No necesitas ser quien tenga más espadas. Solo cuentan las espadas en las zonas activas y no hay desempate para contar rivales con menos (p. 14).',
 'Jaques Couteau': 'No necesitas ser quien tenga más espadas. Estas tiradas no son presionar y no producen un fallo; resuelve Ahora si aparece (p. 14).',
 'Punk Fruit': 'Si conservas los verdes y grises, avanzas en el marcador de fans por fallar con normalidad. Gris claro y oscuro cuentan como el mismo color (p. 15).',
 'Broken Cow': 'Necesitas dos símbolos a la vez. Si fallas, el dado obtenido va a Descarte y aun así debes devolverlo a su reserva al final de la ronda (p. 17).',
}

def slug(text):
    return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFD',text).encode('ascii','ignore').decode().lower()).strip('-')

reference = fitz.open(SOURCE/TRANSLATION)
cards=[]
for page_index,page in enumerate(reference):
    source_text=page.get_text()
    color_pattern='(?:'+'|'.join(colors)+')'
    pattern=rf'({color_pattern})\s*\(\d/6\)\s*(.*?)\s*\((\d+)\)\s*(.*?)(?={color_pattern}\s*\(\d/6\)|\Z)'
    for match in re.finditer(pattern,source_text,re.S):
        color,name,price,body=match.groups()
        name=re.sub(r'\s+',' ',name).strip()
        original=re.sub(r'\s+',' ',body).strip()
        assert name in summaries,name
        text=original
        if name=='Shimmy Shimmy Dino': text='Correr: Gana 1 movimiento por cada dado blanco, gris claro o gris oscuro en tu zona activa.'
        if name=='Up to 11': text=text.replace('antes de que falles','antes de tirar')
        english_page={'red':14,'orange':14,'yellow':15,'green':15,'blue':16,'purple':16,'brown':17,'white':17}[colors[color]]
        if name in ['Reliever Beaver','The Babe']: english_page=15
        cards.append(dict(id=slug(name),name=name,color=colors[color],code=sum(c['color']==colors[color] for c in cards),cost=int(price),summary=summaries[name],text=text,providedText=original,note=notes.get(name,''),phases=list(dict.fromkeys(re.findall(r'(Ahora|Activo|Correr)(?=\s*[:(])',text))),sourcePage=page_index+1,rulebookPage=english_page))
assert len(cards)==56
assert all(sum(c['color']==color for c in cards)==7 for color in colors.values())
(ROOT/'src/data').mkdir(parents=True,exist_ok=True)
(ROOT/'src/data/cards.json').write_text(json.dumps(cards,ensure_ascii=False,indent=2),encoding='utf-8')

book=fitz.open(SOURCE/RULEBOOK)
(ROOT/'assets/dice').mkdir(parents=True,exist_ok=True)
(ROOT/'assets/branding').mkdir(parents=True,exist_ok=True)
order=['red','orange','yellow','green','blue','purple','brown','white']
manifest=[]
for index,color in enumerate(order):
    crop=[95+index*177,1200,272+index*177,1410]
    book[3].get_pixmap(clip=fitz.Rect(crop),matrix=fitz.Matrix(1.3,1.3)).pil_save(ROOT/'assets/dice'/f'{color}.webp')
    manifest.append(dict(file=f'dice/{color}.webp',source=RULEBOOK,page=4,crop=crop))
for name,crop in [('logo',[170,165,1460,465]),('cover',[120,465,1550,1510])]:
    book[0].get_pixmap(clip=fitz.Rect(crop),matrix=fitz.Matrix(.75,.75)).pil_save(ROOT/'assets/branding'/f'{name}.webp')
    manifest.append(dict(file=f'branding/{name}.webp',source=RULEBOOK,page=1,crop=crop))
(ROOT/'assets/manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('56 cartas, 8 colores y 10 recursos originales extraídos.')
