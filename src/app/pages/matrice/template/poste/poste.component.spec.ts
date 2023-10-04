import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosteComponent } from './poste.component';

describe('PosteComponent', () => {
  let component: PosteComponent;
  let fixture: ComponentFixture<PosteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
