import { Component, Input } from '@angular/core';
import { Poste } from 'src/app/models/matrice';

@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.scss'],
})
export class PosteComponent {
  @Input() poste!: Poste;

  public navigateToUser() {
    const url = `https://profile.intra.42.fr/users/${this.poste.user?.login}`;
    if (this.poste.user) window.open(url, '_blank');
  }
}
