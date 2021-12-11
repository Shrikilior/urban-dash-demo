// Common store service to hold the app's global variables

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // Common data list
  private layerListSource: BehaviorSubject<any> = new BehaviorSubject(Object); 
  currentLayerList = this.layerListSource.asObservable(); // components will subscribe to "current..."

  private menuListSource: BehaviorSubject<any> = new BehaviorSubject(Object);
  currentMenuList = this.menuListSource.asObservable();

  private visibleLayersSource: BehaviorSubject<any> = new BehaviorSubject(Object);
  currentVisibleLayers = this.visibleLayersSource.asObservable();

  constructor() { }

  updateList(list: any) {
    this.layerListSource.next(list);
  }

  updateMenu(menuList: Array<string>) {
    this.menuListSource.next(menuList);
  }

  updateVisibleLayers(layerList: Array<string>) {
    this.visibleLayersSource.next(layerList);
  }

}
