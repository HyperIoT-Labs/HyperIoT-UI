import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FourierTransformComponent } from './fourier-transform.component';

describe('FourierTransformComponent', () => {
  let component: FourierTransformComponent;
  let fixture: ComponentFixture<FourierTransformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FourierTransformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FourierTransformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
