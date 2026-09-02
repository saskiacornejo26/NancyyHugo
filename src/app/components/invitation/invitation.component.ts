import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  input,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RevealDirective } from '../../directives/reveal.directive';
import { InvitationData } from '../../models/invitation.model';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ShareItem {
  name: string;
  preview: string;
  kind: 'image' | 'video' | 'file';
  file: File;
}

@Component({
  selector: 'app-invitation',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, RevealDirective],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.scss',
})
export class InvitationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject(ElementRef<HTMLElement>);
  private albumStartX = 0;
  private albumDragging = false;
  private sheetStartY = 0;
  private sheetCanDrag = false;
  private lightboxStartX = 0;

  readonly data = input.required<InvitationData>();

  readonly countdown = signal<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  readonly lightbox = signal<string | null>(null);
  readonly albumIndex = signal(0);
  readonly giftsOpen = signal(false);
  readonly songsOpen = signal(false);
  readonly tipsOpen = signal(false);
  readonly dressOpen = signal(false);
  readonly playlistOpen = signal(false);
  readonly videoOpen = signal(false);
  readonly sheetY = signal(0);
  readonly copied = signal('');
  readonly videoEmbed = computed<SafeResourceUrl | null>(() => {
    const embed = this.toYoutubeEmbed(this.data().coupleVideo.url);
    return embed ? this.sanitizer.bypassSecurityTrustResourceUrl(embed) : null;
  });
  readonly songName = signal('');
  readonly songDetail = signal('');
  readonly songLink = signal('');
  readonly songs = signal<{ name: string; song: string; link: string }[]>([]);
  readonly songState = signal<'idle' | 'saving' | 'done' | 'error'>('idle');
  readonly songMessage = signal('');
  readonly rsvpName = signal('');
  readonly rsvpMessage = signal('');
  readonly rsvpAttending = signal('si');
  readonly rsvpSent = signal(false);
  readonly rsvpError = signal('');
  readonly albumDownloading = signal(false);
  readonly albumDownloadProgress = signal(0);
  readonly shareFiles = signal<ShareItem[]>([]);
  readonly uploadState = signal<'idle' | 'uploading' | 'done' | 'error'>('idle');
  readonly uploadMessage = signal('');
  readonly cameraOpen = signal(false);
  readonly cameraError = signal('');
  readonly facingUser = signal(false);
  private readonly cameraVideo = viewChild<ElementRef<HTMLVideoElement>>('cameraVideo');
  private cameraStream?: MediaStream;

  ngOnInit(): void {
    this.tick();
    const id = window.setInterval(() => this.tick(), 1000);
    const albumId = window.setInterval(() => this.advanceAlbum(), 3000);
    this.destroyRef.onDestroy(() => {
      window.clearInterval(id);
      window.clearInterval(albumId);
      document.body.style.overflow = '';
      this.clearShareFiles();
      this.stopCamera();
    });
  }

  goToSection(id: string): void {
    const section =
      (this.host.nativeElement.querySelector(`[id="${id}"]`) as HTMLElement | null) ??
      document.getElementById(id);
    if (!section) {
      return;
    }
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  calendarUrl(): string {
    const start = this.toCalendarStamp(this.data().date);
    const end = this.toCalendarStamp(new Date(this.data().date.getTime() + 8 * 60 * 60 * 1000));
    const text = `Boda ${this.data().couple.bride} y ${this.data().couple.groom}`;
    const details = `Ceremonia y recepción. ${this.data().city}.`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(this.data().city)}`;
  }

  whatsappUrl(): string {
    const d = this.data();
    const name = this.rsvpName().trim();
    const attending = this.rsvpAttending() === 'si' ? 'Sí, asistiré' : 'No podré asistir';
    const note = this.rsvpMessage().trim();
    const message = [
      `Hola, soy ${name}.`,
      `Confirmación: ${attending}.`,
      note ? `Mensaje: ${note}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `https://wa.me/${d.whatsapp}?text=${encodeURIComponent(message)}`;
  }

  sendRsvp(): void {
    const name = this.rsvpName().trim();
    if (!name) {
      this.rsvpError.set('Escribe tu nombre para confirmar.');
      return;
    }

    this.rsvpError.set('');
    this.rsvpSent.set(true);
    void this.saveRsvpToDrive(name);
    window.open(this.whatsappUrl(), '_blank', 'noopener');
  }

  private async saveRsvpToDrive(name: string): Promise<void> {
    const endpoint = this.data().driveUploadUrl.trim();
    if (!endpoint) {
      return;
    }

    const url = new URL(endpoint);
    url.searchParams.set('type', 'rsvp');
    url.searchParams.set('name', name);
    url.searchParams.set('attending', this.rsvpAttending());
    url.searchParams.set('message', this.rsvpMessage().trim());
    url.searchParams.set('folderId', this.data().driveFolderId);
    await fetch(url.toString(), { method: 'GET', mode: 'no-cors' });
  }

  openGifts(): void {
    this.openSheet(this.giftsOpen);
  }

  closeGifts(): void {
    this.closeSheet(this.giftsOpen);
  }

  openSongs(): void {
    this.openSheet(this.songsOpen);
  }

  closeSongs(): void {
    this.closeSheet(this.songsOpen);
  }

  openTips(): void {
    this.openSheet(this.tipsOpen);
  }

  closeTips(): void {
    this.closeSheet(this.tipsOpen);
  }

  openDress(): void {
    this.openSheet(this.dressOpen);
  }

  closeDress(): void {
    this.closeSheet(this.dressOpen);
  }

  openPlaylist(): void {
    this.openSheet(this.playlistOpen);
  }

  closePlaylist(): void {
    this.closeSheet(this.playlistOpen);
  }

  openVideo(): void {
    this.openSheet(this.videoOpen);
  }

  closeVideo(): void {
    this.closeSheet(this.videoOpen);
  }

  sheetShift(): string {
    return this.sheetY() ? `translateY(${this.sheetY()}px)` : '';
  }

  onSheetDown(event: PointerEvent): void {
    const sheet = event.currentTarget as HTMLElement;
    const fromHandle = !!(event.target as HTMLElement).closest?.('.sheet-handle');
    this.sheetCanDrag = fromHandle || sheet.scrollTop <= 2;
    this.sheetStartY = event.clientY;
    this.sheetY.set(0);
    if (fromHandle) {
      sheet.setPointerCapture?.(event.pointerId);
    }
  }

  onSheetMove(event: PointerEvent): void {
    if (!this.sheetCanDrag || event.buttons === 0) {
      return;
    }

    const dy = event.clientY - this.sheetStartY;
    if (dy > 8) {
      this.sheetY.set(dy);
    } else if (dy < -8) {
      this.sheetCanDrag = false;
      this.sheetY.set(0);
    }
  }

  onSheetUp(): void {
    if (this.sheetY() > 110) {
      this.closeAnySheet();
    }
    this.sheetY.set(0);
    this.sheetCanDrag = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.cameraOpen()) {
      this.closeCamera();
      return;
    }
    if (this.videoOpen()) {
      this.closeVideo();
      return;
    }
    if (this.playlistOpen()) {
      this.closePlaylist();
      return;
    }
    if (this.songsOpen()) {
      this.closeSongs();
      return;
    }
    if (this.tipsOpen()) {
      this.closeTips();
      return;
    }
    if (this.dressOpen()) {
      this.closeDress();
      return;
    }
    if (this.giftsOpen()) {
      this.closeGifts();
    }
  }

  copyGift(label: string, value: string): void {
    void navigator.clipboard.writeText(value).then(() => {
      this.copied.set(label);
      window.setTimeout(() => this.copied.set(''), 2200);
    });
  }

  async addSong(): Promise<void> {
    const name = this.songName().trim();
    const song = this.songDetail().trim();
    const link = this.songLink().trim();
    if (this.songState() === 'saving') {
      return;
    }
    if (!name || !song) {
      this.songState.set('error');
      this.songMessage.set('Escribe tu nombre y la canción.');
      return;
    }

    const endpoint = this.data().driveUploadUrl.trim();
    if (!endpoint) {
      this.songState.set('error');
      this.songMessage.set('Aún no está conectada la lista. Pide a los novios que activen el envío.');
      return;
    }

    this.songState.set('saving');
    this.songMessage.set('Guardando tu sugerencia...');

    try {
      const url = new URL(endpoint);
      url.searchParams.set('type', 'song');
      url.searchParams.set('name', name);
      url.searchParams.set('song', song);
      url.searchParams.set('link', link);
      url.searchParams.set('folderId', this.data().driveFolderId);

      await fetch(url.toString(), { method: 'GET', mode: 'no-cors' });

      this.songs.update((list) => [...list, { name, song, link }]);
      this.songName.set('');
      this.songDetail.set('');
      this.songLink.set('');
      this.songState.set('done');
      this.songMessage.set('Listo. Tu canción ya quedó en la lista de los novios.');
    } catch {
      this.songState.set('error');
      this.songMessage.set('No se pudo guardar. Inténtalo de nuevo.');
    }
  }

  currentPhoto(): string {
    return this.data().gallery[this.albumIndex()] ?? this.data().gallery[0];
  }

  albumTransform(): string {
    return `translateX(calc(16% - ${this.albumIndex()} * 72%))`;
  }

  goToAlbum(index: number): void {
    this.albumIndex.set(index);
  }

  private advanceAlbum(): void {
    if (this.lightbox() || this.albumDragging) {
      return;
    }

    const last = this.data().gallery.length - 1;
    this.albumIndex.update((index) => (index >= last ? 0 : index + 1));
  }

  onPolaroidClick(index: number, src: string): void {
    if (this.albumDragging) {
      return;
    }
    if (index === this.albumIndex()) {
      this.openPhoto(src);
      return;
    }
    this.albumIndex.set(index);
  }

  onAlbumPointerDown(event: PointerEvent): void {
    this.albumStartX = event.clientX;
    this.albumDragging = false;
  }

  onAlbumPointerUp(event: PointerEvent): void {
    const delta = event.clientX - this.albumStartX;
    if (Math.abs(delta) > 40) {
      this.albumDragging = true;
      const last = this.data().gallery.length - 1;
      if (delta > 0) {
        this.albumIndex.update((index) => Math.max(0, index - 1));
      } else {
        this.albumIndex.update((index) => Math.min(last, index + 1));
      }
    }
  }

  openPhoto(src: string): void {
    this.lightbox.set(src);
  }

  closePhoto(): void {
    this.lightbox.set(null);
  }

  onLightboxDown(event: PointerEvent): void {
    this.lightboxStartX = event.clientX;
  }

  onLightboxUp(event: PointerEvent): void {
    const delta = event.clientX - this.lightboxStartX;
    if (Math.abs(delta) < 40) {
      return;
    }

    const photos = this.data().gallery;
    const index = photos.indexOf(this.lightbox() ?? '');
    if (index < 0) {
      return;
    }

    const next = delta > 0 ? Math.max(0, index - 1) : Math.min(photos.length - 1, index + 1);
    this.lightbox.set(photos[next]);
    this.albumIndex.set(next);
  }

  async downloadPhoto(src: string): Promise<void> {
    const index = this.data().gallery.indexOf(src) + 1;
    const name = `${this.data().couple.bride}-${this.data().couple.groom}-${index}.jpg`.toLowerCase();
    await this.saveBlob(src, name);
  }

  async downloadAlbum(): Promise<void> {
    if (this.albumDownloading()) {
      return;
    }

    const photos = this.data().gallery;
    this.albumDownloading.set(true);
    this.albumDownloadProgress.set(0);

    try {
      for (let i = 0; i < photos.length; i++) {
        this.albumDownloadProgress.set(i + 1);
        await this.downloadPhoto(photos[i]);
        if (i < photos.length - 1) {
          await this.wait(700);
        }
      }
    } finally {
      this.albumDownloading.set(false);
      this.albumDownloadProgress.set(0);
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  private async saveBlob(src: string, name: string): Promise<void> {
    try {
      const response = await fetch(src);
      this.clickDownload(await response.blob(), name);
    } catch {
      window.open(src, '_blank', 'noopener');
    }
  }

  private clickDownload(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  onShareFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) {
      return;
    }

    this.shareFiles.update((list) => [
      ...list,
      ...files.map((file) => this.toShareItem(file)),
    ]);
    this.uploadState.set('idle');
    input.value = '';
  }

  async openCamera(): Promise<void> {
    this.cameraError.set('');
    this.cameraOpen.set(true);
    window.setTimeout(() => void this.startCamera());
  }

  async flipCamera(): Promise<void> {
    this.facingUser.update((value) => !value);
    await this.startCamera();
  }

  takePicture(): void {
    const video = this.cameraVideo()?.nativeElement;
    if (!video?.videoWidth) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.shareFiles.update((list) => [...list, this.toShareItem(file)]);
      this.uploadState.set('idle');
      this.closeCamera();
    }, 'image/jpeg', 0.92);
  }

  closeCamera(): void {
    this.stopCamera();
    this.cameraOpen.set(false);
  }

  private async startCamera(): Promise<void> {
    this.stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError.set('Este navegador no permite usar la cámara.');
      return;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: this.facingUser() ? 'user' : { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      });
      const video = this.cameraVideo()?.nativeElement;
      if (video) {
        video.srcObject = this.cameraStream;
        await video.play();
      }
    } catch {
      this.cameraError.set('Permite el acceso a la cámara cuando el navegador lo pida.');
    }
  }

  private stopCamera(): void {
    this.cameraStream?.getTracks().forEach((track) => track.stop());
    this.cameraStream = undefined;
    const video = this.cameraVideo()?.nativeElement;
    if (video) {
      video.srcObject = null;
    }
  }

  openDriveAlbum(): void {
    window.open(this.data().driveAlbumUrl, '_blank', 'noopener');
  }

  async uploadShareFiles(): Promise<void> {
    if (!this.shareFiles().length) {
      this.uploadState.set('error');
      this.uploadMessage.set('Primero carga o toma una foto.');
      return;
    }

    const endpoint = this.data().driveUploadUrl.trim();
    if (!endpoint) {
      this.uploadState.set('error');
      this.uploadMessage.set('El álbum aún no está conectado. Las fotos se quedan aquí, no se abre otra pestaña.');
      return;
    }

    this.uploadState.set('uploading');
    this.uploadMessage.set('Guardando en el álbum...');

    try {
      for (const item of this.shareFiles()) {
        const data = await this.readAsBase64(item.file);
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            filename: item.file.name,
            mimeType: item.file.type || 'application/octet-stream',
            data,
            folderId: this.data().driveFolderId,
          }),
        });
      }

      this.clearShareFiles();
      this.uploadState.set('done');
      this.uploadMessage.set('Listo. Tus fotos se enviaron al álbum.');
    } catch {
      this.uploadState.set('error');
      this.uploadMessage.set('No se pudieron enviar. Inténtalo de nuevo, sin salir de aquí.');
    }
  }

  private toShareItem(file: File): ShareItem {
    return {
      name: file.name,
      preview: URL.createObjectURL(file),
      kind: file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('image/')
          ? 'image'
          : 'file',
      file,
    };
  }

  private readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? '').split(',')[1] ?? '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private clearShareFiles(): void {
    for (const file of this.shareFiles()) {
      URL.revokeObjectURL(file.preview);
    }
    this.shareFiles.set([]);
  }

  private openSheet(state: WritableSignal<boolean>): void {
    this.sheetY.set(0);
    state.set(true);
    document.body.style.overflow = 'hidden';
  }

  private closeSheet(state: WritableSignal<boolean>): void {
    state.set(false);
    this.sheetY.set(0);
    this.syncScroll();
  }

  private closeAnySheet(): void {
    this.giftsOpen.set(false);
    this.songsOpen.set(false);
    this.tipsOpen.set(false);
    this.dressOpen.set(false);
    this.playlistOpen.set(false);
    this.videoOpen.set(false);
    this.sheetY.set(0);
    this.syncScroll();
  }

  private syncScroll(): void {
    const locked =
      this.giftsOpen() ||
      this.songsOpen() ||
      this.tipsOpen() ||
      this.dressOpen() ||
      this.playlistOpen() ||
      this.videoOpen() ||
      this.cameraOpen();
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  private tick(): void {
    const diff = Math.max(0, this.data().date.getTime() - Date.now());
    this.countdown.set({
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff / 3_600_000) % 24),
      minutes: Math.floor((diff / 60_000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    });
  }

  private toCalendarStamp(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private toYoutubeEmbed(url: string): string {
    const raw = url.trim();
    if (!raw) {
      return '';
    }
    if (raw.includes('youtube.com/embed/')) {
      return raw;
    }

    const watch = raw.match(/[?&]v=([\w-]{11})/);
    if (watch?.[1]) {
      return `https://www.youtube.com/embed/${watch[1]}`;
    }

    const short = raw.match(/youtu\.be\/([\w-]{11})/);
    if (short?.[1]) {
      return `https://www.youtube.com/embed/${short[1]}`;
    }

    const shorts = raw.match(/youtube\.com\/shorts\/([\w-]{11})/);
    if (shorts?.[1]) {
      return `https://www.youtube.com/embed/${shorts[1]}`;
    }

    return '';
  }
}
