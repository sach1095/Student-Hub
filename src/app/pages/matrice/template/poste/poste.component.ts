import { Component, Input } from '@angular/core';
import { Poste } from 'src/app/models/matrice';

@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.scss'],
})
export class PosteComponent {
  @Input() poste!: Poste;
  public showTooltip = false;
  public tooltipTimeout?: any; // Pour stocker le timer

  onMouseEnter() {
    if (this.poste.occupe) {
      this.showTooltip = true;
      // Annuler le précédent timeout si l'utilisateur survole à nouveau avant la disparition
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
    }
  }

  onMouseLeave() {
    // Commence le délai pour cacher l'infobulle
    // this.tooltipTimeout = setTimeout(() => {
    this.showTooltip = false;
    // }, 1000); // Délai avant de cacher l'infobulle, ici 1000 millisecondes soit 1 secondes
  }

  ngOnDestroy() {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
  }
}
