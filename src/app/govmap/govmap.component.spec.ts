import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovmapComponent } from './govmap.component';

describe('GovmapComponent', () => {
  let component: GovmapComponent;
  let fixture: ComponentFixture<GovmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GovmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GovmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
