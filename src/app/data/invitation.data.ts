import { InvitationData } from '../models/invitation.model';

const photo = (name: string) => `/img/web/${name}`;

export const INVITATION: InvitationData = {
  couple: {
    bride: 'Nancy',
    groom: 'Hugo',
    monogram: 'N & H',
    hashtag: '¡Los esperamos!',
  },
  date: new Date('2026-10-31T14:00:00-06:00'),
  dateLabel: 'Sábado 31 de octubre de 2026',
  city: 'Villa Lúcumo, Calle 8, Pachacamac',
  quote: 'Un amor que siempre encuentra una nueva razón para quedarse.',
  story:
    'Somos una pareja que ha construido su historia a lo largo de 12 años, creciendo y evolucionando juntos, nuestra relación se sostiene en la complicidad, el cariño y la decisión de compartir el camino. ',
  parents: [
    {
      title: 'Padres de la novia',
      names: ['David Hugo Martinez Arellano', 'Maura Victoria Linares Cunza'],
    },
    {
      title: 'Padres del novio',
      names: ['Hugo Guillermo Robles Pérez', 'Olga Noriega Victoria'],
    },
  ],
  padrinos: [
    {
      title: 'Padrinos',
      names: ['Randolph Tito Esquivel', 'Beatriz Elena Martinez León'],
    },
  ],
  venues: [
    {
      title: 'Ceremonia',
      time: '3:00 pm',
      name: 'Villa Lúcumo',
      address: 'Villa Lúcumo, Calle 8, Pachacamac, Perú',
      mapUrl:
        'https://www.google.com/maps?q=-12.2058094,-76.866435',
    },
  ],
  itinerary: [
    { time: '3:00 pm', title: 'Ceremonia Religiosa', detail: 'Nos damos el sí', icon: 'ceremony' },
    { time: '5:00 pm', title: 'Recepción', detail: 'Bienvenida en la hacienda', icon: 'reception' },
    { time: '6:00 pm', title: 'Brindis', detail: 'Un brindis por nosotros', icon: 'toast' },
    { time: '7:00 pm', title: 'Cena', detail: 'Mesa y discursos', icon: 'dinner' },
    { time: '8:00 pm', title: 'Fiesta', detail: 'A bailar hasta tarde', icon: 'party' },
    { time: '1:00 am', title: 'Fin', detail: 'Nos despedimos de nuestros invitados', icon: 'car' },
  ],
  gallery: [
    photo('01.jpg'),
    photo('02.jpg'),
    photo('04.jpg'),
    photo('05.jpg'),
    photo('06.jpg'),
    photo('08.jpg'),
    photo('09.jpg'),
    photo('10.jpg'),
    photo('11.jpg'),
  ],
  dressCode: {
    title: 'Formal / etiqueta',
    text: 'Paleta ivory, beige arena, olivo, terracota y gold. Les pedimos evitar el blanco y el rojo intenso.',
    colors: [
      { name: 'Ivory', hex: '#f7f9f4' },
      { name: 'Beige arena', hex: '#D8C8B3' },
      { name: 'Olivo', hex: '#747C58' },
      { name: 'Terracota', hex: '#D07A55' },
      { name: 'Gold', hex: '#C8A75D' },
    ],
  },
  gifts: {
    bankAccount: '9460437685',
    interbank: '00913520946043768556',
    yape: '940280720',
    registryUrl: 'https://sinenvolturas.com/nancyhugo/regalos',
  },
  tips: [
    {
      title: 'Puntualidad',
      text: 'La ceremonia religiosa inicia a las 3:00 pm.',
    },
    {
      title: 'Solo adultos',
      text: 'Evento exclusivo para adultos.',
    },
    {
      title: 'Ceremonia Religiosa',
      text: 'Momento sin cámaras de celular, nuestros profesionales se encargarán de las fotos.',
    },
    {
      title: 'Estacionamiento',
      text: 'Contamos con estacionamiento para nuestros invitados. Los espacios estarán disponibles por orden de llegada.',
    },
  ],
  couplePlaylist: [
    {
      title: 'Perfect',
      artist: 'Ed Sheeran',
      url: 'https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v',
    },
    {
      title: 'Hasta la raíz',
      artist: 'Natalia Lafourcade',
      url: 'https://open.spotify.com/track/0HZvCWPmkH7A9j3YfTzB1S',
    },
    {
      title: 'Die With A Smile',
      artist: 'Lady Gaga & Bruno Mars',
      url: 'https://open.spotify.com/track/2plbrEY59I2D54U1Xbw2e2',
    },
  ],
  coupleVideo: {
    title: 'Nuestra historia',
    caption: 'Un pedacito de nosotros, para verlo con calma.',
    url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
  },
  rsvpDeadline: '14 de octubre de 2026',
  whatsapp: '51940747047',
  musicTitle: 'Summertime',
  // Archivo MP3 (no YouTube). Pon el mp3 en public/audio/ y deja esta ruta,
  // o pega una URL directa que termine en .mp3
  musicUrl: '/audio/cancion.mp3',
  driveAlbumUrl:
    'https://drive.google.com/drive/folders/11eJdMf_xqjmCigrZzS9vguAdOpVFTDSy?usp=sharing',
  driveFolderId: '11eJdMf_xqjmCigrZzS9vguAdOpVFTDSy',
  // Pega aquí la URL de implementación de scripts/drive-album-upload.gs
  driveUploadUrl: 'https://script.google.com/macros/s/AKfycbxSamLGKqB-lixeVaJN4FZyFe3ftbISOyKNN2jvdYvnRcTl5Y1GA2kY1APDFtC2Tb-d7Q/exec',
  // Se crea sola en la carpeta de Drive como "Canciones sugeridas"
  songsSheetUrl: 'https://docs.google.com/spreadsheets/d/1TsP1sC1H1IEJNY3So2xEvTGOrhmB1mgmSg0dAr-D9xs/edit',
};
