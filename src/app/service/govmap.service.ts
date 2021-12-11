import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParameterCodec } from '@angular/common/http'; // currently not in use
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class GovmapService {

  private layerUrl = "https://ags.govmap.gov.il/Layers/GetAdditionalLayers";

  constructor(private http: HttpClient, private _store: StoreService) {
    
   }

   encodeRequest(req: string) {
    return encodeURIComponent(req);
   }

   // Created http request (POST), gets the list
   // Updates the common store so all subscribing components will be updated
   getAllLayers() {
    this.http.post(this.layerUrl, { title: 'POST to get Layers' }).subscribe(list => {
      // console.log("list from service", list);
      this._store.updateList(list);
      return list;
    });
   }

}

// https://www.govmap.gov.il/govmap/api/govmap.api.js
