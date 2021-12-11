import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

// imports for scripting (for importing the latlng to utm converter)
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { } from 'googlemaps';
import { StoreService } from '../service/store.service';
import { GovmapService } from '../service/govmap.service';

@Component({
  selector: 'gmap',
  templateUrl: './gmap.component.html',
  styleUrls: ['./gmap.component.css']
})
export class GmapComponent implements OnInit, AfterViewInit {

  // getting the map element and saving it into mapElement
  @ViewChild('map') mapElement: any;
  // instantiating a "map" variable to hold the google map
  map!: google.maps.Map;
  // instantiating an info window
  infoWindow!: google.maps.InfoWindow;
  polygon!: google.maps.Data.Polygon;
  
  // the layer list - will be updated using the httpservice
  layersList!: any;
  // The list which contains the currently visible layers (by names)
  visibleLayers: Array<string> = [];

  constructor(private _service: GovmapService, private _store: StoreService, private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document) { }

  ngOnInit(): void {
    // One time action - on app load, sending a request to the httpservice to load the Layer list
    // and update the common store
    this.layersList = this._service.getAllLayers();

    // and now we subscribe to the common layer list...
    this._store.currentLayerList.subscribe(list => {
      this.layersList = list;
    });

    // Loading / Saving list to localstorage (currently disabled creates bug)
    // if (localStorage.getItem('visibleLayers')) {
    //   const storeVisibleLayers = localStorage.getItem('visibleLayers')?.split(' ')
    //   this._store.updateVisibleLayers(storeVisibleLayers!);
    // } else {
    //   this._store.updateVisibleLayers([]);
    // }
    this._store.updateVisibleLayers([]);


    // Subscribing to the "currently visible Layers" array
    // On list change - test if a layer was added or removed
    // And turn on or off accordingly
    this._store.currentVisibleLayers.subscribe((list: Array<string>) => {
      
      // Saving to localStorage
      // localStorage.setItem('visibleLayers', list.join(' '));
      
      // imlementing on / off test here..
      // Layer on test
      list.forEach(newEl => {
        let isNew = true;
        this.visibleLayers.forEach(currEl => {
          if (newEl == currEl) {
            isNew = false;
          }
        });
        // if the entry is new - turn layer ON
        if (isNew) {
          this.showLayer(newEl);
        }
      });
      // Should we turn a Layer off test
      this.visibleLayers.forEach(curEl => {
        let isOff = true;
        list.forEach(newEl => {
          // if the entry exists - leave it on
          if (newEl == curEl) isOff = false;
        });
        // if an entry was removed - turn it off
        if (isOff) {
          this.hideLayer(curEl);
        }
      })

      this.visibleLayers = list;

    });
  }

  ngAfterViewInit() {
    const mapProperties = {
      center: new google.maps.LatLng(32.827432, 34.979504), // Haifa
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapProperties);
  }


  showLayer(layerName: string) {

    if (!this.layersList.data) return;
    const currentLayerData = this.layersList.data.AdditionalLayers[layerName];

    // Some test....
    // console.log("Changin menu");
    // this._store.updateMenu(["ATMS", "BANKS", "SCHOOL", "KIDS_G", "ATRACTIONS", "BUS_STOPS"]);

    // const imageMapType = new google.maps.ImageMapType({
    //   getTileUrl: (coord, zoom) => {
    //     if (zoom >=15) {
    //       return this.generateTileUrl(coord, zoom, "164", "גושים", "100001");
    //     }
    //     return "";
    //   },
    //   tileSize: new google.maps.Size(1092, 969)
    // });

    const imageMapLayer = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        if (zoom >=15) {
          return this.generateTileUrl(coord, zoom, currentLayerData.layerID, currentLayerData.caption, currentLayerData.minScale);
        }
        return "";
      },
      tileSize: new google.maps.Size(1092, 969),
      name: layerName
    });

    // this.map.overlayMapTypes.push(imageMapType);
    this.map.overlayMapTypes.push(imageMapLayer);

  }

  hideLayer(layerName: string) {
    this.map.overlayMapTypes.forEach((overlay, i) => {
      if (overlay?.name == layerName) this.map.overlayMapTypes.removeAt(i);
    });
  }

  generateTileUrl(coord: Object, zoom: number, id: string, name: string, minScale: string) {

    // Calling the bbox converter

    const bbox_converted = this.tileCoordsToBBox(this.map, coord, zoom, 1092, 969);
    const bbox_utm = this.convertCoords(bbox_converted);

    // building the url

    const dynamicLayers = `dynamicLayers=[{"id":${id},"name":"${name}","source":{"type":"mapLayer","mapLayerId":${id}},"minScale":100001,"maxScale":0}]`

    const stdSettings = "&dpi=96&transparent=true&format=png32";
    const layers = `&layers=show%3A164`;
    const bbox = `bbox=${bbox_utm}`;
    const bboxSR = `&bboxSR=2039`;
    const size = `&size=1092%2C969`;
    const format = `&f=image`;

    const tileUrl = 'https://ags.govmap.gov.il/proxy/proxy.ashx?http://govmap/arcgis/rest/services/AdditionalData/MapServer/export?'+encodeURIComponent(dynamicLayers)+stdSettings+layers+'&'+encodeURIComponent(bbox)+bboxSR+size+format;
    return tileUrl;

  }

  // a function that gets the 2 corners of the google map current view
  // and converts them to "bbox" format (which will later be used to retrieve the layer from "govmap")
  
  tileCoordsToBBox(map: google.maps.Map, coord: any, zoom: number, tileWidth: number, tileHeight: number) {
    var proj = this.map.getProjection();

    // scale is because the number of tiles shown at each zoom level double.
    var scale = Math.pow(2, zoom);

    // A point is created for the north-east and south-west corners, calculated
    // by taking the tile coord and multiplying it by the tile's width and the map's scale.
    // Note: the "!" was added to the "proj" to refrain from an error "object is possibly null"
    // The "!" is like an "if not null" test...
    var ne = proj!.fromPointToLatLng(new google.maps.Point( (coord.x+1) * tileWidth / scale, coord.y * tileHeight / scale));
    var sw = proj!.fromPointToLatLng(new google.maps.Point( coord.x * tileWidth / scale, (coord.y+1) * tileHeight / scale));

    return [
        sw.lng().toString(),
        sw.lat().toString(),
        ne.lng().toString(),
        ne.lat().toString()
    ];
  }

  // Converting lat long to utm
  // This function only exists since I somehow could not properly import the JSITM (tried multiple ways..)
  // This is a workaround....
  convertCoords(inputCoords: Array<string>) {

    // The input here is the output array of tileCoordsToBBox
    // also switching order to "lat long"
    const sw = [inputCoords[1], inputCoords[0]].join(' ');
    const ne = [inputCoords[3], inputCoords[2]].join(' ');

    // Additions for scripting
    let script = this._renderer2.createElement('script');
    script.type = 'text/javascript';
    script.src = '../assets/js-itm.js'
    script.text = ``;
    this._renderer2.appendChild(this._document.body, script);
    let script_alert = this._renderer2.createElement('script');
    script_alert.type = 'text/javascript';
    script_alert.text = `
      localStorage.setItem('convertedSW', JSITM.gpsRef2itmRef("${sw}"));
      localStorage.setItem('convertedNE', JSITM.gpsRef2itmRef("${ne}"));
    `;
    this._renderer2.appendChild(this._document.body, script_alert);
    return [localStorage.getItem('convertedSW'), localStorage.getItem('convertedNE')].join(' ').split(' ').join(',');
  }


  ///////////////////////////////////////////////////////////////// Additional test functions

  addGeoJSON() {
    const pos = new google.maps.LatLng(-28, 137);
    this.map.setCenter(pos);
    this.map.setZoom(5);
    this.map.data.loadGeoJson(
      "https://storage.googleapis.com/mapsdevsite/json/google.json"
    );

  }

  
  addPolygons() {

    const pos = new google.maps.LatLng(-33.872, 151.252);
    this.map.setCenter(pos);
    new google.maps.Marker({
      position: pos,
      map: this.map,
      title: "Thats sydney mate"
    });

    this.map.setZoom(5);

    // Define the LatLng coordinates for the outer path.
    const outerCoords = [
      { lat: -32.364, lng: 153.207 }, // north west
      { lat: -35.364, lng: 153.207 }, // south west
      { lat: -35.364, lng: 158.207 }, // south east
      { lat: -32.364, lng: 158.207 }, // north east
    ];

    // Define the LatLng coordinates for an inner path.
    const innerCoords1 = [
      { lat: -33.364, lng: 154.207 },
      { lat: -34.364, lng: 154.207 },
      { lat: -34.364, lng: 155.207 },
      { lat: -33.364, lng: 155.207 },
    ];

    // Define the LatLng coordinates for another inner path.
    const innerCoords2 = [
      { lat: -33.364, lng: 156.207 },
      { lat: -34.364, lng: 156.207 },
      { lat: -34.364, lng: 157.207 },
      { lat: -33.364, lng: 157.207 },
    ];

    this.map.data.add({
      geometry: new google.maps.Data.Polygon([
        outerCoords,
        innerCoords1,
        innerCoords2,
      ]),
    });

    this.polygon = new google.maps.Data.Polygon([
      outerCoords,
      innerCoords1,
      innerCoords2,
    ]);

  }

  
  moveToLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // adding marker on current location
          new google.maps.Marker({
            position: pos,
            map: this.map,
            title: "You are here"
          });

          // this.infoWindow.setPosition(pos);
          // this.infoWindow.setContent("Location found.");
          // this.infoWindow.open(this.map);

          // moving the map to current location
          this.map.setCenter(pos);
        },
        () => {
          this.handleLocationError(true, this.infoWindow, this.map.getCenter()!);
        }
      );
    } else {
      // Browser doesn't support Geolocation
      this.handleLocationError(false, this.infoWindow, this.map.getCenter()!);
    }
  }

  handleLocationError(
    browserHasGeolocation: boolean,
    infoWindow: google.maps.InfoWindow,
    pos: google.maps.LatLng
  ) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(this.map);
  }

}
