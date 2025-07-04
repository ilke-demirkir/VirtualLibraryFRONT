import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarDisplayComponent } from './star-display.component';

describe('StarDisplayComponent', () => {
  let component: StarDisplayComponent;
  let fixture: ComponentFixture<StarDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StarDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
