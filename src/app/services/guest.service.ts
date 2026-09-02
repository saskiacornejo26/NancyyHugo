import { Injectable } from '@angular/core';
import { GuestInfo } from '../models/invitation.model';

@Injectable({ providedIn: 'root' })
export class GuestService {
  readonly info: GuestInfo;

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('invitado')?.trim();
    const passes = Number(params.get('pases'));

    this.info = {
      name: name || 'Familia Herrera',
      passes: Number.isFinite(passes) && passes > 0 ? passes : 2,
    };
  }
}
