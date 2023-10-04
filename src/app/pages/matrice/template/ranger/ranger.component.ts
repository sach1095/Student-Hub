import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Ranger } from 'src/app/models/matrice';

@Component({
  selector: 'app-ranger',
  templateUrl: './ranger.component.html',
  styleUrls: ['./ranger.component.scss'],
})
export class RangerComponent {
  @Input() ranger!: Ranger;
  @Input() zoneIndex!: number;
}
