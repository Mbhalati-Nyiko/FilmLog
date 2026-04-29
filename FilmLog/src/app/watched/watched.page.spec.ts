import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { WatchedPage } from './watched.page';

describe('WatchedPage', () => {
  let component: WatchedPage;
  let fixture: ComponentFixture<WatchedPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WatchedPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(WatchedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
