import {GenericMap} from "./generic-map";

export interface LeafletMap extends GenericMap {
  minZoom?: number;
  maxZoom?: number;
}
