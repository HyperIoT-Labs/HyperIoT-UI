import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketsFormComponent } from './packets-form.component';

describe('PacketsFormComponent', () => {
  let component: PacketsFormComponent;
  let fixture: ComponentFixture<PacketsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
