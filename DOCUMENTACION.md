# Documentación — Invitación Nancy y Hugo

Invitación digital de boda en Angular. El invitado abre un sobre virtual, ve el monograma de la pareja y entra a la página con música, itinerario, álbum, regalos, RSVP y subida de fotos.

Fecha de esta revisión: 3 de septiembre de 2026.

---

## 1. Cómo verla

```bash
npm start
```

Abre `http://localhost:4200`.

Enlace personalizado por invitado:

`http://localhost:4200/?invitado=María%20Fernández&pases=3`

| Comando | Uso |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run optimize-photos` | Optimizar fotos con Sharp |

---

## 2. Stack

- Angular 19 (componentes standalone, signals)
- TypeScript 5.7
- SCSS
- Google Fonts: Cormorant Garamond, Great Vibes, Outfit, Playfair Display
- Google Apps Script para Drive (fotos, canciones, confirmaciones)

Los textos, fechas, fotos y enlaces viven en `src/app/data/invitation.data.ts`.

---

## 3. Estructura

```
src/app/
  app.component.*              Portada o invitación + control de música
  data/invitation.data.ts      Contenido de la boda
  models/invitation.model.ts   Tipos
  services/guest.service.ts    Query ?invitado= y ?pases=
  directives/reveal.directive.ts  Animación al hacer scroll
  components/
    envelope/                  Sobre, sello y tarjeta que sale
    invitation/                Página completa

public/
  audio/cancion.mp3            Música de fondo (Summertime)
  img/monogram-nh.jpg          Foto que sale al abrir el sobre
  img/web/                     Álbum
  img/itinerary/               Iconos del itinerario

scripts/
  drive-album-upload.gs        Backend de Drive
  optimize-photos.mjs          Compresión de fotos
```

Flujo:

1. `AppComponent` muestra el sobre mientras `opened` es `false`.
2. Al tocar el sello, la solapa se levanta, el sello se oculta y sale el monograma.
3. A los 1,45 s se emite `opened`, se muestra la invitación y arranca la música.
4. El botón de música queda fijo para pausar o reanudar.

---

## 4. Evento

| Campo | Valor |
|---|---|
| Novios | Nancy y Hugo |
| Monograma | N & H / N y H |
| Hashtag | #NancyYHugo2026 |
| Fecha | Sábado 31 de octubre de 2026, 14:00 (hora Perú) |
| Lugar | Villa Lúcumo, Calle 8, Pachacamac |
| Ceremonia | 15:00 hrs |
| WhatsApp RSVP | 51940747047 |
| Límite RSVP | 14 de octubre de 2026 |
| Vestimenta | Formal / etiqueta. Evitar blanco y rojo intenso |
| Paleta | Ivory, beige arena, olivo, terracota, gold |

Itinerario: Ceremonia 15:30 · Recepción 18:00 · Brindis 19:00 · Cena 19:30 · Fiesta 20:30.

Regalos: cuenta Scotiabank `9460437685`, CCI `00913520946043768556`, Yape `940280720`, lista en [sinenvolturas.com/nancyhugo/regalos](https://sinenvolturas.com/nancyhugo/regalos).

---

## 5. Qué incluye la página

**Sobre**

- Texto “Tienes una invitación” y “Nancy y Hugo”.
- Sello de cera terracota (botón para abrir).
- Al abrir: misma animación (solapa 3D, sello que desaparece, tarjeta que sube) con la foto `public/img/monogram-nh.jpg`.

**Invitación (visible)**

- Menú: Itinerario, Álbum, Regalos, Tips, Confirmación.
- Portada con foto, nombres, fecha y ciudad.
- Cuenta regresiva y “Guardar la fecha” (Google Calendar, 8 horas).
- Padres y padrinos.
- Lugar + mapa.
- Itinerario con iconos.
- Álbum (carrusel, lightbox, descarga).
- Código de vestimenta (modal).
- Regalos (modal con cuentas y Yape).
- Tips (puntualidad, solo adultos, valet, clima).
- RSVP por WhatsApp; también se guarda en Drive.
- Subida de fotos/videos a Drive, o foto con la cámara del celular.
- Pie con hashtag.

**Secciones en el código, ocultas por ahora**

Historia, playlist de la pareja, video y “Sugerir canción”. Los modales y el Apps Script siguen listos.

**Música**

- Archivo: `public/audio/cancion.mp3` (`musicTitle`: Summertime).
- Empieza al abrir el sobre.
- Se reproduce **completa** y en bucle.
- El botón pausa o reanuda. Si el navegador bloquea el autoplay, el invitado puede tocarlo.

---

## 6. Cambios de esta sesión (2–3 sep 2026)

### 6.1 Música completa

Antes el audio se cortaba a los 30 s (`musicClipSeconds`) y volvía al inicio.

Ahora en `app.component.ts`:

- se quitó el recorte;
- `audio.loop = true`;
- la canción suena entera y se repite.

### 6.2 Iniciales del sello: “N y H”

El “&” cursivo se leía como una “e”. El sello muestra **N y H** en serif, con la “y” más pequeña.

### 6.3 Tipografía del hero

Se cambió “Nancy & Hugo” de Great Vibes a Cormorant Garamond porque la “y” de Nancy se leía mal. **Se revirtió.** El hero sigue en Great Vibes; el conector es “y”.

### 6.4 Sello 3D

El sello SVG irregular se reemplazó por un botón circular CSS:

- aro elevado, centro hundido, letras en relieve;
- color terracota;
- borde adelgazado (el primero era muy grueso);
- fuente **Playfair Display** itálica.

Un intento de monograma escalonado N / & / H con Bodoni Moda **se revirtió**. Quedó **N y H** en Playfair.

Archivos: `envelope.component.html`, `envelope.component.scss`, `src/index.html` (carga Playfair Display).

### 6.5 Foto al abrir el sobre

La tarjeta ya no dice “Nuestra boda / N & H”. Sale el monograma floral (`/img/monogram-nh.jpg`) con la misma animación.

La tarjeta es cuadrada (`aspect-ratio: 1`) para no recortar la foto.

---

## 7. Cómo está hecho el sobre

| Pieza | Qué hace |
|---|---|
| `.paper` | Cuerpo del sobre |
| `.card` | Tarjeta oculta; al abrir, `opacity: 1` y `translateY(-78px)` |
| `.flap` | Solapa; al abrir, `rotateX(168deg)` |
| `.seal` | Sello; al abrir, se desvanece y sube un poco |

El delay de 1450 ms en `envelope.component.ts` deja terminar la animación antes de pasar a la invitación.

---

## 8. Integraciones

Google Apps Script: `scripts/drive-album-upload.gs`.

URL desplegada (también en `invitation.data.ts`):

`https://script.google.com/macros/s/AKfycbxSamLGKqB-lixeVaJN4FZyFe3ftbISOyKNN2jvdYvnRcTl5Y1GA2kY1APDFtC2Tb-d7Q/exec`

| Función | Destino |
|---|---|
| Fotos del día | Carpeta Drive `11eJdMf_xqjmCigrZzS9vguAdOpDSy` |
| Canciones sugeridas | Hoja “Canciones sugeridas” y CSV |
| Confirmaciones RSVP | Hoja “Confirmaciones” y CSV |

Álbum público: [carpeta de Drive](https://drive.google.com/drive/folders/11eJdMf_xqjmCigrZzS9vguAdOpVFTDSy?usp=sharing).

Canciones: [hoja de cálculo](https://docs.google.com/spreadsheets/d/1TsP1sC1H1IEJNY3So2xEvTGOrhmB1mgmSg0dAr-D9xs/edit).

---

## 9. Personalizar

Edita `src/app/data/invitation.data.ts`:

- nombres, fecha, lugar, itinerario, textos;
- `gallery`: archivos en `public/img/web/`;
- `musicUrl`: MP3 en `public/audio/`;
- WhatsApp, Drive, cuentas.

El monograma del sobre: reemplaza `public/img/monogram-nh.jpg`.

Invitado por URL: `GuestService` lee `?invitado=` y `?pases=` (si no hay datos, usa “Familia Herrera” y 2 pases).

---

## 10. Estado visual final

| Elemento | Cómo quedó |
|---|---|
| Sello | Círculo 3D terracota, borde fino, **N y H** en Playfair |
| Apertura | Solapa + sello + tarjeta que sube (igual que antes) |
| Tarjeta | Foto del monograma floral |
| Hero | Great Vibes, “Nancy y Hugo” |
| Música | Completa, en bucle, con pausa |

---

## 11. Pendientes / residuos

El `README.md` y la meta description de `src/index.html` siguen hablando de Sofía y Diego y San Miguel de Allende. El contenido real es Nancy y Hugo en Pachacamac.

`GuestService` existe, pero el sobre ya no muestra el nombre ni los pases del invitado.

Secciones comentadas (historia, playlist, video, sugerir canción): se pueden volver a mostrar quitando los comentarios en `invitation.component.html`.

En tips, el clima dice “Septiembre” y la boda es en octubre.

El menú tiene “Más”, pero esa sección está comentada.

---

## 12. Archivos tocados en esta sesión

| Archivo | Cambio |
|---|---|
| `src/app/app.component.ts` | Música completa en loop |
| `src/app/components/envelope/envelope.component.html` | Sello CSS + foto del monograma |
| `src/app/components/envelope/envelope.component.scss` | Efecto 3D, borde fino, animación de la tarjeta |
| `src/index.html` | Fuente Playfair Display |
| `public/img/monogram-nh.jpg` | Imagen nueva |

No se tocó la lógica de RSVP, Drive, álbum ni itinerario.
