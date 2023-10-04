import { Component, Input } from '@angular/core';
import { Zone } from 'src/app/models/matrice';

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss'],
})
export class ZoneComponent {
  @Input() zone!: Zone;
  @Input() zoneIndex!: number;
}
