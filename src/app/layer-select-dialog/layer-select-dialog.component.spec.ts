import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerSelectDialogComponent } from './layer-select-dialog.component';

describe('LayerSelectDialogComponent', () => {
  let component: LayerSelectDialogComponent;
  let fixture: ComponentFixture<LayerSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayerSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
