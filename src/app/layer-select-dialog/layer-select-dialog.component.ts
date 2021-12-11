import { Component, OnInit } from '@angular/core';
import { StoreService } from '../service/store.service';

@Component({
  selector: 'layer-select-dialog',
  templateUrl: './layer-select-dialog.component.html',
  styleUrls: ['./layer-select-dialog.component.css']
})
export class LayerSelectDialogComponent implements OnInit {

  layerList!: any;
  additionalLayers!: any;
  menuLayerNames: Array<string> = [];
  fullListNames: Array<string> = [];
  pageListNames: Array<string> = []; // for pagination
  entriesPerPage = 10;
  currentPage = 1;
  totalPages = 1;

  constructor(private _store: StoreService) { }

  ngOnInit(): void {
    this._store.currentLayerList.subscribe(list => {
      this.layerList = list;
      this.additionalLayers = list.data.AdditionalLayers;
      // populating full list names (for iterations from the template)
      for (let layer in this.additionalLayers) {
        this.fullListNames.push(layer);
      }
      // Pagination
      for (let i = (this.currentPage - 1)*10 ; i < this.entriesPerPage + (this.currentPage - 1)*10 ; i++) {
        this.pageListNames[i] = this.fullListNames[i];
      }
    });
    this._store.currentMenuList.subscribe(menuNames => this.menuLayerNames = menuNames);
    this.totalPages = Math.floor(this.fullListNames.length / this.entriesPerPage);
  }

  markEntry(layerName: string) {
    this.additionalLayers[layerName].isAdded = true;
  }

  unMarkEntry(layerName: string) {
    this.additionalLayers[layerName].isAdded = false;
  }

  addToList() {
    let isNew = true;
    for (let layer in this.additionalLayers) {
      // testing to see if layer is already in the menu
      if (this.additionalLayers[layer].isAdded) {
        this.menuLayerNames.forEach(curName => {
          if (layer == curName) {
            isNew = false;
            console.log("comparison layer: ", layer);
            console.log("comparison curname: ", curName);
          }
        });
        if (isNew) {
          this.menuLayerNames.push(layer);
        }
      }
    }
    this._store.updateMenu(this.menuLayerNames);
    for (let layer in this.additionalLayers) { this.additionalLayers[layer].isAdded = false;}
  }

  nextPage(direction: string) {
    if (direction == "up") this.currentPage++;
    if (direction == "down") this.currentPage--;
    if (this.currentPage*this.entriesPerPage >= this.fullListNames.length) this.currentPage = 1;
    if (this.currentPage <= 1) this.currentPage = this.totalPages;
    this.pageListNames = [];
    let j = 0;
    for (let i = (this.currentPage - 1)*10 ; i < this.entriesPerPage + (this.currentPage - 1)*10 ; i++) {
      this.pageListNames[j] = this.fullListNames[j + (this.currentPage - 1)*10];
      j++;
    }
  }

}
