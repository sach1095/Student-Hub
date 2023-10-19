import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Poste } from 'src/app/models/matrice';
import { UserMatriceService } from 'src/app/services/matrice.service';

@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.scss'],
})
export class PosteComponent implements AfterViewInit {
  @ViewChild('posteRef') posteRef!: ElementRef;
  @Input() poste!: Poste;
  public showTooltip = false;
  public tooltipTimeout?: any; // Pour stocker le timer
  public tooltipPosition = '';
  public tooltipPositionVert: 'top' | 'bottom' = 'top';
  public tooltipPositionHoriz: 'left' | 'right' = 'left';

  constructor(private userMatriceService: UserMatriceService) {}

  ngAfterViewInit() {
    this.userMatriceService.addPoste(this.posteRef);
  }

  onMouseEnter() {
    if (this.poste.occupe) {
      this.showTooltip = true;
      // Annuler le précédent timeout si l'utilisateur survole à nouveau avant la disparition
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
      this.calculateTooltipPosition();
    }
  }

  calculateTooltipPosition() {
    // Vérifiez si 'ranger' est supérieur à 9 pour déterminer la position verticale
    if (this.poste.ranger > 9) {
      this.tooltipPositionVert = 'top';
    } else {
      this.tooltipPositionVert = 'bottom';
    }

    // Vérifiez si 'poste' est supérieur ou égal à 4 pour déterminer la position horizontale
    if (this.poste.poste >= 4) {
      this.tooltipPositionHoriz = 'right';
    } else {
      this.tooltipPositionHoriz = 'left';
    }

    // Combine les positions verticale et horizontale pour obtenir la position finale de l'infobulle
    // Ceci est utile si votre système de tooltip prend en charge des positions comme 'top-right', 'bottom-left', etc.
    this.tooltipPosition = `${this.tooltipPositionVert}-${this.tooltipPositionHoriz}`;
  }

  onMouseLeave() {
    // Commence le délai pour cacher l'infobulle
    // this.tooltipTimeout = setTimeout(() => {
    // this.showTooltip = false;
    // }, 5000); // Délai avant de cacher l'infobulle, ici 1000 millisecondes soit 1 secondes
  }

  ngOnDestroy() {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
  }
}
