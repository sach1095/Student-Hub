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
  public tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

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
    // Obtenir les coordonnées de l'élément
    const rect = this.posteRef.nativeElement.getBoundingClientRect();

    // Variables pour déterminer l'espace disponible dans toutes les directions
    const spaceTop = rect.top;
    const spaceBottom = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;

    // Déterminez la taille de votre infobulle, assurez-vous que ces valeurs correspondent à vos besoins
    const tooltipHeight = 400; // ou toute autre valeur basée sur la hauteur réelle de votre infobulle
    const tooltipWidth = 320; // ou toute autre valeur basée sur la largeur réelle de votre infobulle

    // Logique pour déterminer la position de l'infobulle
    if (spaceBottom < tooltipHeight + 200 && spaceTop > tooltipHeight) {
      this.tooltipPosition = 'top';
    } else if (spaceRight < tooltipWidth && spaceLeft > tooltipWidth) {
      this.tooltipPosition = 'left';
    } else if (spaceLeft < tooltipWidth && spaceRight > tooltipWidth) {
      this.tooltipPosition = 'right';
    } else {
      this.tooltipPosition = 'bottom'; // position par défaut
    }
  }

  onMouseLeave() {
    // Commence le délai pour cacher l'infobulle
    // this.tooltipTimeout = setTimeout(() => {
    this.showTooltip = false;
    // }, 5000); // Délai avant de cacher l'infobulle, ici 1000 millisecondes soit 1 secondes
  }

  ngOnDestroy() {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
  }
}
