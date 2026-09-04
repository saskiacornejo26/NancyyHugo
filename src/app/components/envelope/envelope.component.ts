import { Component, input, output, signal } from '@angular/core';
import { Couple } from '../../models/invitation.model';

@Component({
  selector: 'app-envelope',
  standalone: true,
  templateUrl: './envelope.component.html',
  styleUrl: './envelope.component.scss',
  host: {
    '[class.is-opening]': 'opening()',
  },
})
export class EnvelopeComponent {
  readonly couple = input.required<Couple>();
  readonly opened = output<void>();

  readonly opening = signal(false);

  open(): void {
    if (this.opening()) {
      return;
    }

    this.opening.set(true);
    window.setTimeout(() => this.opened.emit(), 1200);
  }
}
