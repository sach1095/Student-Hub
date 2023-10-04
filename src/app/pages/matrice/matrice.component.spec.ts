import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatriceComponent } from './matrice.component';

describe('MatriceComponent', () => {
  let component: MatriceComponent;
  let fixture: ComponentFixture<MatriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatriceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
