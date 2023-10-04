import { Component, Input } from '@angular/core';
import { Poste } from 'src/app/models/matrice';

@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.scss'],
})
export class PosteComponent {
  @Input() poste!: Poste;
}
