import { Component, OnInit } from '@angular/core';
import { GovmapService } from '../service/govmap.service';
import { StoreService } from '../service/store.service';
import { MatDialog } from '@angular/material/dialog';
import { LayerSelectDialogComponent } from '../layer-select-dialog/layer-select-dialog.component';

@Component({
  selector: 'layer-menu',
  templateUrl: './layer-menu.component.html',
  styleUrls: ['./layer-menu.component.css']
})
export class LayerMenuComponent implements OnInit {

  layerList!: any;
  additionalLayers!: any;
  listLoadedFlag = false;
  visibleLayers: Array<string> = [];

  menuLayerNames = [ "PARCEL_ALL", "SUB_GUSH_ALL", "SCHOOL", "KIDS_G", "ATRACTIONS", "BUS_STOPS" ];

  constructor(private _service: GovmapService, private _store: StoreService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this._store.currentLayerList.subscribe(list => {
      this.layerList = list;
      if (list.data && !this.listLoadedFlag) {
        this.listLoadedFlag = true;
        this.ngOnInit(); // possibly can loop here.. add error q counter... and also do unsubscribe...
        // console.log("layer list from menu subscription:", this.layerList);
        this.additionalLayers = list.data.AdditionalLayers;
        // manually adding missing icons
        this.additionalLayers['PARCEL_ALL'].layerIcon.css = "parcel_all";
        this.additionalLayers['SUB_GUSH_ALL'].layerIcon.css = "sub_gush_all";
        this.additionalLayers['NEIGHBORHOODS_AREA'].layerIcon.css = "neighborhoods_Area";
        this.additionalLayers['STATISTIC_AREAS_2011'].layerIcon.css = "statistic_areas_2011";

        // updating the menu with loadOnStart
        this.menuLayerNames = [];
        for (let layer in this.additionalLayers) {
          if (this.additionalLayers[layer].loadOnStart) this.menuLayerNames.push(layer);
        }
        this._store.updateMenu(this.menuLayerNames);
      }
    });
    
    this._store.currentMenuList.subscribe(menuList => this.menuLayerNames = menuList);
    this._store.currentVisibleLayers.subscribe(visible => {
      this.visibleLayers = visible;
    });


  }

  logList() {
    console.log("Full list: ", this.layerList);
    console.log("Test: ", this.additionalLayers["SCHOOL"]);
  }

  showLayer(layerName: string) {
    this.additionalLayers[layerName].isActive = true;
    // "push" is altering the "_store" too since the "this.visibleLayers" points to the same variable in mem
    // do not use push here...
    // this.visibleLayers.push(layerName); 
    this._store.updateVisibleLayers([this.visibleLayers, layerName].flat());
  }

  showLayer_B() {
    this._store.updateVisibleLayers(["SCHOOL", "ATRACTIONS", "PARCEL_ALL"]);
  }

  hideLayer(layerName: string) {
    this.additionalLayers[layerName].isActive = false;
    let newVisLayers: Array<string> = [];
    this.visibleLayers.forEach((layer) => {
      if (layerName !== layer) {
        newVisLayers.push(layer);
      }
    });
    this._store.updateVisibleLayers(newVisLayers);
  }

  openLayerSelectDialog() {
    const dialogRef = this.dialog.open(LayerSelectDialogComponent);
  }

}
