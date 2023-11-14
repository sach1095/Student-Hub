import { Component, ElementRef, Input, OnChanges, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import KeenSlider, { KeenSliderInstance } from 'keen-slider';
import { GaugeComponent } from './gauge/gauge.component';
import { DateUtils } from 'src/app/models/dateUtils';
import { UserService } from 'src/app/services/user.service';

interface GaugeData {
  month: string;
  timeTotal: any;
}

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements OnChanges {
  @Input() timeByMonthKeys!: string[];
  @Input() timeTotals: any;
  @Input() isAlternant!: boolean;
  indexes: number[] = [];
  public gaugeDataArray: GaugeData[] = [];
  @ViewChild('sliderRef')
  sliderRef!: ElementRef<HTMLElement>;
  @ViewChildren(GaugeComponent)
  gaugeComponents!: QueryList<GaugeComponent>;
  slider?: KeenSliderInstance;
  public showButtonSave = false;
  public ShowCalendar = false;

  currentSlide: number = 1;
  dotHelper: Array<Number> = [];

  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.userService.isSomethingChanged$.subscribe((value) => {
      this.showButtonSave = value;
    });
    this.timeByMonthKeys.forEach((month) => {
      const gaugeData: GaugeData = {
        month: month,
        timeTotal: this.timeTotals[month],
      };
      this.gaugeDataArray.push(gaugeData);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeByMonthKeys'] || changes['timeTotals']) {
      this.gaugeDataArray = this.timeByMonthKeys.map((month) => {
        return {
          month: month,
          timeTotal: this.timeTotals[month],
        };
      });
    }
  }

  swap() {
    this.ShowCalendar = !this.ShowCalendar;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.slider = new KeenSlider(this.sliderRef.nativeElement, {
        initial: this.timeByMonthKeys.length - 1,
        loop: {
          min: 0,
          max: this.timeByMonthKeys.length - 1,
        },
        range: {
          align: true,
          min: 0,
          max: this.timeByMonthKeys.length - 1,
        },
        mode: 'free-snap',
        detailsChanged: (s) => {
          this.indexes = s.track.details.slides.map((slide) => {
            return slide.abs;
          });
          this.currentSlide = s.track.details.rel;
        },
        slides: {
          number: this.timeByMonthKeys.length,
          perView: 1,
        },
      });
      this.dotHelper = [...Array(this.slider.track.details.slides.length).keys()];
    });
  }

  public getMonthNameFromDate(dateString: string) {
    return DateUtils.getMonthNameFromDate(dateString);
  }

  public processSave() {
    this.userService.updateUser();
    this.showButtonSave = false;
  }
}
