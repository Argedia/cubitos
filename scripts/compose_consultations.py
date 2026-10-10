"""Curated integrated Spanish consultations, not concatenated source excerpts.
Primary: Cubitos rulebook pp. 9, 11, 13–17. Secondary: supplied Spanish effects.
Each entry records its sources; the original card transcriptions stay untouched.
Run after extract_content.py. No dependencies beyond Python's standard library.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
cards = json.loads((ROOT/'src/data/cards.json').read_text(encoding='utf-8'))
entries = {}

def section(title, *paragraphs):
    return dict(title=title, paragraphs=list(paragraphs))

def put(id, pages, *sections, decision=None):
    card = next(c for c in cards if c['id'] == id)
    entries[id] = dict(sections=list(sections), rulebookPages=pages, translationPage=card['sourcePage'])
    if decision: entries[id]['sourceDecision'] = decision

fan_count = 'Usa el número de la casilla que ocupas en el marcador de fans; si sigues en las gradas, cuenta 0.'
free_buy = 'Este dado gratuito no consume ninguna de las dos compras de dados de la ronda.'
active_colors = 'Para comprobar los colores, cuenta cualquier dado en tu zona activa, incluso si está mostrando una cara vacía.'
extra_roll = 'Esta tirada adicional no es presionar: no puedes fallar con ella. Los éxitos van a la zona activa y los resultados vacíos permanecen en Tirar. Resuelve normalmente las habilidades Ahora que aparezcan.'
refill = 'Si no quedan suficientes dados en Robo, pasa primero los de Descarte a Robo y continúa eligiendo.'

def now_draw(n):
    return section('Ahora · tirada adicional', f'Al obtener este símbolo y llevarlo a la zona activa, puedes elegir {n} dados de Robo y tirarlos en Tirar. Debes decidirlo en ese momento.', refill, extra_roll)

def lose_self():
    return 'Durante Correr debes devolver este dado a su reserva, aunque renuncies al beneficio. Si fallaste y el dado pasó a Descarte, su habilidad Correr no se resuelve y no lo pierdes por ella.'

def sword_comparison(tie=False):
    result = 'Compara las espadas de las zonas activas durante Correr. Solo quien tenga más puede aplicar este efecto; conserva esa condición el resto de la ronda aunque después use o pierda dados.'
    if tie:
        result += ' En empate gana la persona empatada más cercana al jugador inicial, empezando por este y siguiendo en sentido horario.'
    else:
        result += ' Si varias personas empatan por el máximo, nadie tiene más y este efecto no se aplica.'
    return result

def red_loss(color='rojo'):
    return f'Si te corresponde resolver este efecto, debes perder 1 dado {color} y devolverlo a su reserva, aunque renuncies al beneficio.' if color else 'Si te corresponde resolver este efecto, debes perder 1 dado y devolverlo a su reserva, aunque renuncies al beneficio. Puedes elegirlo de cualquier zona, pero nunca el dado de jugador inicial.'

put('the-big-cheese', [15,13,9],
    section('Correr · elige un beneficio', 'Por cada dado que uses, elige entre ganar 1 movimiento o ganar tantos movimientos como la mitad de tus fans, redondeando hacia abajo.', fan_count),
    section('Ejemplo', 'Con 5 fans, la segunda opción da 2 movimientos. Con 0 o 1 fan, puedes elegir la primera opción para ganar 1 movimiento. No sumes las dos opciones.'))

put('dugout',[14,13,9],now_draw(3))
put('fast-cat',[17,13,9],now_draw(2))
put('batter-beaver',[14,13,9],now_draw(2),
    section('Correr · pérdida obligatoria', 'Después de Mover y cobrar los premios, si has ganado al menos 1 crédito en cualquier momento de esta ronda, debes perder 1 dado de cualquiera de tus zonas y devolverlo a su reserva. No puedes perder el dado de jugador inicial.', 'Cuentan los créditos obtenidos por cualquier medio: premios, marcador de fans, dados o habilidades. La obligación existe aunque no hayas usado la habilidad Ahora.', 'Si fallaste y este dado pasó a Descarte, su habilidad Correr no se resuelve: no pierdes un dado por ella.'))
put('reliever-beaver',[15,13,9],
    section('Correr · elimina un dado', 'Puedes elegir 1 dado que siga en tu zona de Tirar y devolverlo a su reserva. No puedes elegir el dado de jugador inicial.', 'Si no queda ninguno en Tirar, la habilidad no tiene efecto. Los grises devueltos pueden dejarse en una pila común o en la caja.'))
put('benchwarmer',[14,13,9],
    section('Correr · elimina dos dados', 'Puedes devolver este dado naranja y otro dado de cualquiera de tus zonas a sus reservas. Si usas la habilidad, devuelves ambos; no elijas solo uno.', 'El segundo dado no puede ser el de jugador inicial. Los grises devueltos pueden dejarse en una pila común o en la caja.'))
put('the-babe',[15,9,13],
    section('Correr', 'Con el símbolo normal, gana 5 monedas. Con el símbolo especial, también gana 1 movimiento y devuelve este dado a su reserva.', 'La devolución al resolver el símbolo especial es obligatoria aunque renuncies a sus beneficios. No se pierde el dado por esta carta si muestra el símbolo normal.'))
put('pinch-eater',[14,9],
    section('Ahora · elige un resultado', 'Al obtener este símbolo y llevarlo a la zona activa, puedes tomar 1 dado de Tirar, colocarlo en tu zona activa y dejarlo mostrando la cara que prefieras.', 'Si eliges una cara con habilidad Ahora, puedes resolverla inmediatamente. Si no quedan dados en Tirar, no hay efecto.'))
put('mr-bats',[14,13,9],
    section('Correr · elige un beneficio', 'Por cada dado que uses, gana 2 monedas o gana créditos iguales a la mitad de tus fans, redondeando hacia abajo. No sumes ambas opciones.', fan_count),
    section('Ejemplo', 'Con 5 fans, eliges entre 2 monedas para esta ronda o 2 créditos que puedes guardar para otra ronda.'))

put('reckless-cheese',[15,13,9],
    section('Activo · al presionar con éxito', 'Cada vez que presiones y no falles, puedes ganar 1 movimiento por este dado y usarlo inmediatamente, durante la fase Tirar.', 'Ese desplazamiento no permite cobrar premios ni activar atajos o propulsores: solo pueden resolverse en el paso Mover de la fase Correr. El efecto puede repetirse al volver a presionar sin fallar.'))
put('the-cheese-stands-alone',[15,9],
    section('Ahora · debes seguir tirando', 'Al obtener este símbolo, debes presionar una vez más. Es obligatorio incluso si tienes menos de 3 dados activos y todavía no hay riesgo de fallar.', 'Si obtienes varios de estos símbolos en la misma tirada, te obligan a presionar solo una vez más. Si vuelve a aparecer en una tirada posterior, esa nueva aparición vuelve a obligarte a presionar.'),
    section('Correr', 'Cada dado que puedas usar en esta fase da 3 movimientos.'))
put('ledercheesen',[15,13,9],
    section('Activo · al presionar con éxito', 'Cada vez que presiones y no falles, puedes tomar 1 dado de Robo y tirarlo en Tirar. Si Robo está vacío, repón con Descarte antes de tomarlo.', extra_roll),
    section('Correr · símbolo especial', 'Además, cada dado con símbolo especial que uses da 1 movimiento por cada grupo completo de 4 dados en tu zona activa. Cuenta también las caras vacías.', 'Con 7 dados activos ganas 1 movimiento por este efecto. Varios dados de esta carta permiten usar sus habilidades por separado.'))
put('bad-cheese',[15,9,13],
    section('Correr', 'Con el símbolo normal, gana 2 movimientos. Con el símbolo especial, también gana 3 monedas y devuelve este dado a su reserva.', 'Con el símbolo especial debes devolverlo aunque renuncies a sus beneficios. Con el símbolo normal no lo pierdes por esta carta.'))
put('cheese-boy',[15,13,9],
    section('Correr · comprueba los colores', 'Con al menos 1 dado café activo, puedes ganar 2 movimientos. Con al menos 1 dado naranja activo, puedes perder 1 dado de Tirar y devolverlo a su reserva.', 'Si tienes ambos colores, puedes usar uno o los dos beneficios. Tener más dados de un mismo color no multiplica ese beneficio.', active_colors, 'La pérdida solo puede elegirse de Tirar y nunca afecta al dado de jugador inicial.'))
put('stinky-cheese',[15,9],
    section('Correr', 'Gana 2 movimientos. Con el símbolo especial, además, tus dados grises claros y oscuros no cuentan para el límite de robo en la siguiente fase Tirar.', 'La excepción afecta al límite de robo; no cambia el color de los dados ni sus resultados.'))

put('mr-soldier',[14,13,11],
    section('Correr · compara espadas', sword_comparison(True), 'Quien tenga más gana 3 créditos y 2 movimientos.', red_loss()))
put('punch-guy',[14,13,11],
    section('Correr · compara espadas', sword_comparison(), 'En la siguiente fase Tirar, tus dados blancos y verdes no cuentan para el límite de robo. Aun así cuentan para el fallo: si todos los dados tirados quedan vacíos, puedes fallar con normalidad.', red_loss()))
put('crabby',[14,13,11],
    section('Correr · compara espadas', 'Cada símbolo especial cuenta como 2 espadas.', sword_comparison(True), 'Quien tenga más entrega 1 dado de cualquiera de sus zonas a una persona con el menor total de espadas activas. Si varias empatan por el mínimo, quien entrega elige a cuál.', 'La persona que recibe el dado lo coloca en Descarte; recibirlo no consume sus compras de la ronda. No puedes entregar el dado de jugador inicial.', red_loss()))
put('supah-general',[14,13,11],
    section('Correr · compara espadas', sword_comparison(), 'Quien tenga más gana tantos movimientos como su número de fans.', fan_count, red_loss()),
    section('Ejemplo', 'Con 5 fans, el beneficio es de 5 movimientos.'))
put('champion',[14,13,11],
    section('Correr · compara espadas', sword_comparison(), 'En la siguiente fase Tirar, puedes pasar a Tirar todos los dados que tengas en Robo, Activa y Descarte, sin respetar el límite de robo. Puedes dejar en sus zonas los que prefieras no robar.', red_loss('')))

red_rivals = 'No necesitas tener más espadas que todo el mundo. Cuenta solo a los rivales con menos espadas que tú en sus zonas activas; quienes empaten contigo no cuentan y no hay desempate. Los rivales con 0 cuentan si tú tienes al menos 1.'
red_power = 'Cada símbolo especial rojo cuenta como 2 espadas. Ignora los dados de Robo, Tirar y Descarte al comparar.'
put('el-bandito',[14,13,11],
    section('Correr · compara con cada rival', red_rivals, red_power, 'Gana 1 crédito por cada rival que tenga menos espadas que tú.'))
put('jaques-couteau',[14,13,11],
    section('Correr · compara con cada rival', red_rivals, red_power, 'Por cada rival que tenga menos espadas, elige 2 dados tuyos que no sean rojos, de cualquiera de tus zonas, y tíralos en Tirar.', extra_roll))

put('rock-on',[15,9,13],
    section('Activo · antes de presionar', 'Cada vez que decidas presionar, puedes pasar este dado de Activa a Tirar antes de la tirada. Lo tiras junto con todos los demás de Tirar.', 'Si vuelve a mostrar el símbolo y regresa a Activa, podrás usarlo otra vez antes de volver a presionar. Si ya habías empezado a arriesgar un fallo, sigues arriesgándolo aunque al mover dados queden menos de 3 en Activa.'))
put('rolling-stoned',[15,13,9],
    section('Activo · evita un fallo', 'Solo puedes usarlo cuando fueras a fallar después de presionar. Usa este dado y tira tus dados grises claros y oscuros de cualquiera de tus zonas. Pasa los éxitos a Activa y deja los vacíos en Tirar.', 'Con al menos un éxito evitas el fallo y puedes elegir entre presionar otra vez o pasar. Sin éxitos, fallas; si tienes otro dado de esta carta utilizable en Activa, puedes repetir el intento con él.'))
put('pina-cubelada',[15,9],
    section('Activo · protege una tirada', 'Usa este dado en Activa para no poder fallar la próxima vez que presiones esta ronda, aunque todos los resultados sean vacíos.', 'La protección termina después de esa tirada. Para proteger otra necesitas usar otro dado con este símbolo. Si no vuelves a presionar, no obtienes beneficio.'))
put('keep-on-rollin',[15,13,9],
    section('Activo · evita un fallo perdiendo el dado', 'Cuando fueras a fallar, puedes devolver este dado de Activa a su reserva para evitarlo.', 'Después eliges entre pasar y terminar Tirar, o presionar de nuevo con el riesgo normal de fallar. Perder el dado es el coste de usar esta protección.'))
put('up-to-11',[15,13,9],
    section('Activo · antes de presionar', 'Puedes pasar este dado de Activa a Tirar antes de la tirada y tirarlo junto con los demás. La decisión se toma antes de tirar, no después de ver un fallo.', 'Puedes repetirlo cada vez que vuelvas a tener este símbolo activo y decidas presionar.'),
    section('Correr · símbolo especial', 'Si este dado conserva el símbolo especial en Activa durante Correr, puedes duplicar tus espadas. Tener solo el símbolo normal no permite ese efecto.'),
    decision='La traducción decía «antes de que falles». Se usa el momento «antes de tirar» indicado en la p. 15 del manual.')
put('punk-fruit',[15,13,9],
    section('Activo · al fallar', 'Puedes conservar todos tus dados verdes y grises en Activa; pasa los demás dados activos a Descarte. Avanza 1 casilla en el marcador de fans y cobra los premios por fallar con normalidad.'),
    section('Correr · después de haber fallado esta ronda', 'Usa un dado con este símbolo en Activa para elegir hasta 9 dados de colores distintos entre Robo y Tirar, y tíralos una vez. Puedes elegir menos, incluso ninguno.', extra_roll, 'Gris claro y gris oscuro son un solo color; el dado de jugador inicial es un color propio. Varios símbolos activos permiten repetir la habilidad, y los dados que queden en Activa pueden usarse normalmente durante Correr.'))
put('pineapple-rocks',[15,13,9],
    section('Activo · antes de presionar', 'Si usas la habilidad, pasa este dado de Activa a Tirar antes de tirar; se lanza junto con todos los demás dados de Tirar.', 'Con el símbolo especial, debes pasar también otro dado de Activa a Tirar, si hay alguno. No puedes usar el efecto normal del símbolo especial y omitir ese traslado adicional.', 'Puedes repetir la habilidad cada vez que vuelvas a tener el símbolo activo y presiones. Una vez que arriesgas fallar, mover dados fuera de Activa no elimina ese riesgo.'))

put('stogie',[16,9],
    section('Ahora · vuelve a tirar blancos y grises', 'Al obtener este símbolo, puedes tomar todos tus dados blancos y grises claros y oscuros de Robo y Tirar, y tirarlos en Tirar. No incluye los de Activa ni los de Descarte.', extra_roll))
put('bob',[16,11,13],
    section('Correr · después de Mover, antes de Comprar', 'Por cada dado que uses, cobra el premio de una casilla situada a 1 o 2 espacios de tu posición final. Para contar la distancia puedes pasar por cualquier casilla, incluida el agua.', 'No puedes elegir la casilla donde terminaste el movimiento. Sí puedes elegir la casilla de premio donde empezaste la ronda si ahora está a 1 o 2 espacios.', 'Si usas varios dados de esta carta, cada uno puede cobrar el mismo premio.'))
put('chilly-mcchillster',[16,9],
    section('Correr · monedas y dos tiradas', 'Gana 2 monedas. Tira todos los dados que tengas en Tirar; mueve los éxitos a Activa y deja los vacíos en Tirar. Luego repite con los dados que sigan en Tirar.', 'Estas tiradas no son presionar y no pueden provocar un fallo. Resuelve las habilidades Ahora que aparezcan; los dados incorporados a Activa pueden usarse normalmente.'))
put('llama-rama',[16,13,9],
    section('Correr', 'Gana 3 monedas. Con el símbolo especial, además ganas 1 fan: avanza 1 casilla en el marcador de fans.', 'En ese avance sí recibes las fichas de mano que indique la casilla, pero no sus créditos. El avance del símbolo especial no se omite si usas su beneficio normal.'))
put('llama-shaman',[16,13,9],
    section('Correr · monedas y un dado gratuito', 'Gana 2 monedas y toma 1 dado rojo de su reserva; colócalo en Descarte. Si no queda ningún rojo disponible, aún puedes ganar las 2 monedas.', free_buy))

def water_effect(id, money, moves):
    start = f'Gana {money} monedas y {moves} movimiento.' if money else f'Gana {moves} movimientos.'
    put(id,[16,13,11],
        section('Correr · movimiento por agua', start+' Los movimientos de esta habilidad pueden usarse para entrar en agua en cualquier momento del paso Mover.', 'Si activas un propulsor, los movimientos de esta habilidad que aún no hayas gastado se duplican y conservan la capacidad de entrar en agua.', 'Terminar en agua no te da permiso permanente para cruzarla. Si solo hay agua alrededor, necesitarás otra habilidad de movimiento por agua para salir.'))
water_effect('undercover-fish',0,2)
water_effect('bahama-llama',3,1)

put('rollosaurus',[16,9],section('Correr','Cada dado que uses da 4 movimientos.'))
put('shimmy-shimmy-dino',[16,13,9],
    section('Correr · cuenta blancos y grises', 'Gana 1 movimiento por cada dado blanco, gris claro o gris oscuro en tu zona activa. Cuenta también los que muestren una cara vacía.', 'Los verdes no cuentan para esta habilidad.'),
    decision='La hoja traducida incluía verdes. La p. 16 del manual especifica blancos, grises claros y grises oscuros.')

def combo_dino(id, first, second):
    put(id,[16,13,9],section('Correr · suma los beneficios',f'Gana 2 movimientos. Con al menos 1 dado {first} activo puedes sumar 2 movimientos; con al menos 1 dado {second} activo puedes sumar 1 movimiento.', 'Si tienes ambos colores, puedes usar ambos adicionales y ganar un total de 5 movimientos por este dado. Cada color activa su adicional una sola vez, aunque tengas varios dados de ese color.', active_colors))
combo_dino('dancing-dino','rojo','naranja')
combo_dino('you-bet-jurassican','café','amarillo')
put('cubasaurus',[16,13,9],
    section('Ahora · toma un dado temporal', 'Al obtener este símbolo, puedes tomar gratis cualquier dado disponible de una reserva y colocarlo en Activa con la cara que prefieras. Si muestra una habilidad Ahora, puedes resolverla.', free_buy, 'Devuelve obligatoriamente ese dado prestado a su reserva al final de la ronda. Si fallas antes, pasa a Descarte y aun así lo devuelves al terminar la ronda.'),
    section('Correr · el dado morado', 'Gana 4 movimientos y devuelve este dado morado a su reserva obligatoriamente. Si un fallo lo mandó antes a Descarte, no resuelves su habilidad Correr y no pierdes el morado por ella.', 'Son dos devoluciones distintas: el dado prestado se devuelve al final de la ronda; el morado se pierde al resolver su habilidad Correr.'),
    decision='Se sigue «cualquier dado de una reserva» de la p. 16 del manual; la hoja traducida añadía una exclusión de los morados que no figura en esa aclaración.')
put('pronto-bronto',[16,11],
    section('Correr · calcula antes de mover', 'Gana 2 movimientos por cada grupo completo de 3 líneas rojas que aún te separen de la meta. Calcula todos los dados de esta carta antes de empezar a mover, durante el paso de usar habilidades.', 'En varias vueltas o pistas, cuenta solo hasta el final de la vuelta o pista actual. En una ronda de desempate después de que alguien haya cruzado la meta, esta habilidad no tiene efecto.'),
    section('Ejemplo', 'Si te faltan 5 líneas rojas y usas 2 dados de esta carta, cada uno da 2 movimientos: 4 en total. No recalcules el segundo después de mover.'))
put('wikiwiki-dinosaur',[16,13,9],
    section('Correr · cuenta colores distintos', 'Gana 1 movimiento por cada color diferente que tengas en Activa. Incluye el morado de este dado y cuenta los dados con cara vacía.', 'Gris claro y gris oscuro cuentan juntos como un solo color. El dado de jugador inicial cuenta como un color propio.'))

put('rich-dog',[17,13,9],section('Correr','Gana 3 monedas.',lose_self()))
put('mr-dog',[17,13,9],section('Correr','Gana 2 créditos.',lose_self()))
put('dr-livingstone',[17,13,9],section('Correr','Gana 2 movimientos.',lose_self()))
put('captain-bark',[17,13,9],
    section('Correr · fans y créditos', 'Si tienes al menos 1 dado blanco y 1 rojo en Activa, puedes ganar 1 fan y avanzar una casilla en su marcador. Recibes las fichas de mano de esa casilla, pero no sus créditos.', active_colors, 'Además, puedes ganar 2 créditos por la segunda habilidad aunque no cumplas la condición de colores.', lose_self()))
put('wizard',[17,13,9],
    section('Activo · al presionar con éxito','Cada vez que presiones y no falles, puedes ganar 1 crédito por este dado.'),
    section('Correr · pérdida obligatoria',lose_self()))
put('dapper-doggie',[17,13,9],
    section('Correr · repite lo que dan tus grises', 'Gana otra vez las monedas y movimientos producidos por los dados grises de tu zona activa. Cada dado de esta carta repite ese total una vez.', lose_self(), 'La devolución es obligatoria incluso si tus grises no produjeron monedas ni movimientos.'),
    section('Ejemplo','Si tus grises dan 3 monedas y usas 2 dados de esta carta, ganas 6 monedas adicionales: 9 contando las originales. Después pierdes los dos dados café.'))
put('muggles',[17,13,9],now_draw(2),section('Correr','Gana 2 monedas.',lose_self()))

put('smelly-cat',[17,9],section('Correr','Cada dado que uses da 2 movimientos.'))
put('cat-tastrophy',[17,13,9],
    section('Correr · elige un dado gratuito', 'Toma de una reserva 1 dado cuyo precio sea igual o menor que tu número de fans y colócalo en Descarte.', fan_count, 'Los dados grises claros y oscuros cuestan 0 a efectos de esta habilidad. Si no hay ningún dado disponible que cumpla el precio, no obtienes ninguno.', free_buy))
put('schmutz',[17,11,13],
    section('Correr · movimiento y beneficio por perder dados', 'Gana 1 movimiento. Después de Mover y cobrar los premios, si has perdido al menos 1 dado esta ronda por una habilidad o por una casilla de perder dado, gana también 3 créditos.', 'Basta perder un dado para activar los 3 créditos; perder varios no aumenta ese beneficio por este dado.'))
put('broken-cow',[17,13,9],
    section('Activo · necesitas dos símbolos', 'Usa dos símbolos de esta carta juntos para activar la habilidad. Con uno solo no hay efecto.', 'Toma gratis 1 dado disponible de cualquier reserva y colócalo en Activa mostrando la cara que prefieras. Si eliges una habilidad Ahora, puedes resolverla.', free_buy),
    section('Al final de la ronda · devuelve el dado prestado','Devuelve obligatoriamente el dado obtenido a su reserva. Si fallas antes, pasa a Descarte y aun así debes devolverlo al final de la ronda. Esta devolución afecta al dado prestado, no a los dos blancos usados.'))
put('fat-cat',[17,13,9],
    section('Correr · movimiento y un dado gris', 'Gana 1 moneda y 3 movimientos. Al usar el beneficio de movimiento, debes ganar 1 dado gris si queda alguno disponible.', 'Si no quedan grises, puedes obtener el movimiento igualmente. Pueden estar disponibles los grises extra del juego, los que sobren por jugar con menos personas y los devueltos por otras habilidades o premios.', free_buy),
    decision='Se conserva la moneda indicada por el efecto traducido: la aclaración de la p. 17 desarrolla el movimiento y la obligación de ganar un gris, sin negar ese otro beneficio.')
put('dope-cat',[17,13,9],
    section('Correr · comprueba los colores', 'Con al menos 1 dado café en Activa, puedes ganar 2 monedas. Con al menos 1 dado verde en Activa, puedes ganar 3 monedas.', 'Si tienes ambos colores, puedes usar ambos beneficios y ganar 5 monedas. Varios dados del mismo color no multiplican su beneficio.', active_colors))

assert set(entries) == {c['id'] for c in cards}, ({c['id'] for c in cards} - set(entries))
assert all(e['sections'] and all(s['paragraphs'] for s in e['sections']) for e in entries.values())
(ROOT/'src/data/consultations.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(entries)} integrated consultations generated.')
