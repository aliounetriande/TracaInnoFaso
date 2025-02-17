import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreerDataPalettePage } from './creer-data-palette.page';

describe('CreerDataPalettePage', () => {
  let component: CreerDataPalettePage;
  let fixture: ComponentFixture<CreerDataPalettePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreerDataPalettePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
