import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaInnerareaSelectDialogComponent } from './area-innerarea-select-dialog.component';

describe('AreaInnerareaSelectDialogComponent', () => {
  let component: AreaInnerareaSelectDialogComponent;
  let fixture: ComponentFixture<AreaInnerareaSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaInnerareaSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaInnerareaSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
