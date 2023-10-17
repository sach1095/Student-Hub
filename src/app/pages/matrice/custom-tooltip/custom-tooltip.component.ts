import { Component, Input } from '@angular/core';
import { Poste } from 'src/app/models/matrice';

@Component({
  selector: 'app-custom-tooltip',
  templateUrl: './custom-tooltip.component.html',
  styleUrls: ['./custom-tooltip.component.scss'],
})
export class CustomTooltipComponent {
  @Input() poste!: Poste;

  constructor() {}

  public navigateToUser() {
    const url = `https://profile.intra.42.fr/users/${this.poste.user?.login}`;
    if (this.poste.user) window.open(url, '_blank');
  }
}
