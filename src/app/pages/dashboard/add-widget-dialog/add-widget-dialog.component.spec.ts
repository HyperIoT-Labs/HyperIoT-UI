import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWidgetDialogComponent } from './add-widget-dialog.component';

describe('ModalDialogComponent', () => {
  let component: AddWidgetDialogComponent;
  let fixture: ComponentFixture<AddWidgetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddWidgetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWidgetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
