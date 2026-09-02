import { Component, OnDestroy, signal } from '@angular/core';
import { EnvelopeComponent } from './components/envelope/envelope.component';
import { InvitationComponent } from './components/invitation/invitation.component';
import { INVITATION } from './data/invitation.data';

@Component({
  selector: 'app-root',
  imports: [EnvelopeComponent, InvitationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  private static readonly musicClipSeconds = 30;

  readonly invitation = INVITATION; // datos de la boda
  readonly opened = signal(false);
  readonly musicOn = signal(false);

  private audio?: HTMLAudioElement;

  openInvitation(): void {
    this.opened.set(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.startMusic();
  }

  toggleMusic(): void {
    if (!this.invitation.musicUrl) {
      this.musicOn.update((value) => !value);
      return;
    }

    if (!this.audio) {
      this.startMusic();
      return;
    }

    if (this.audio.paused) {
      void this.audio.play().then(() => this.musicOn.set(true)).catch(() => this.musicOn.set(false));
    } else {
      this.audio.pause();
      this.musicOn.set(false);
    }
  }

  ngOnDestroy(): void {
    this.audio?.pause();
    this.audio?.removeEventListener('timeupdate', this.onMusicTimeUpdate);
    this.audio?.removeEventListener('ended', this.onMusicEnded);
  }

  private startMusic(): void {
    if (!this.invitation.musicUrl) {
      this.musicOn.set(true);
      return;
    }

    if (!this.audio) {
      this.audio = new Audio(this.invitation.musicUrl);
      this.audio.loop = false;
      this.audio.addEventListener('timeupdate', this.onMusicTimeUpdate);
      this.audio.addEventListener('ended', this.onMusicEnded);
    }

    void this.audio.play().then(() => this.musicOn.set(true)).catch(() => this.musicOn.set(false));
  }

  private readonly onMusicTimeUpdate = (): void => {
    if (!this.audio || this.audio.currentTime < AppComponent.musicClipSeconds) {
      return;
    }
    this.audio.currentTime = 0;
  };

  private readonly onMusicEnded = (): void => {
    if (!this.audio) {
      return;
    }
    this.audio.currentTime = 0;
    void this.audio.play();
  };
}
