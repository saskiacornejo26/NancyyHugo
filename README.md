# Invitación de boda — Sofía & Diego

Prototipo en Angular de una invitación digital estilo sobre virtual, pensada para compartirse por WhatsApp.

## Cómo verla

```bash
npm start
```

Abre `http://localhost:4200`.

Para personalizar al invitado:

`http://localhost:4200/?invitado=María%20Fernández&pases=3`

## Qué incluye

- Sobre virtual con nombre del invitado y número de pases
- Portada, cuenta regresiva y guardar la fecha
- Padres, historia, ceremonia, recepción e itinerario
- Álbum, código de vestimenta, mesa de regalos y notas
- Confirmación por WhatsApp
- Sugerencias de canciones

## Cómo personalizarla

Edita `src/app/data/invitation.data.ts`: nombres, fecha, lugares, fotos, WhatsApp y textos.

Si agregas un MP3 en `public/audio/cancion.mp3`, pon la ruta en `musicUrl` para que suene al abrir el sobre.
