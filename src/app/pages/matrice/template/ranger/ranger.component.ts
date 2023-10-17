import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Ranger } from 'src/app/models/matrice';
import { ViewChildren, QueryList, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ranger',
  templateUrl: './ranger.component.html',
  styleUrls: ['./ranger.component.scss'],
})
export class RangerComponent {
  @Input() ranger!: Ranger;
  @Input() zoneIndex!: number;
  @ViewChildren('posteRef') postes!: QueryList<ElementRef>;

  ngAfterViewInit() {
    console.log('scrollToPoste elemet ranger');
    console.log(this.postes);
  }
}
