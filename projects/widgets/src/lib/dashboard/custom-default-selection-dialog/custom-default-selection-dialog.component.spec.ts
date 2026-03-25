import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDefaultSelectionDialogComponent } from './custom-default-selection-dialog.component';

describe('CustomDefaultSelectionDialogComponent', () => {
  let component: CustomDefaultSelectionDialogComponent;
  let fixture: ComponentFixture<CustomDefaultSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomDefaultSelectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomDefaultSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
