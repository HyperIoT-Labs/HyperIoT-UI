import {GenericMap} from "./generic-map";

export interface LeafletMapConfig extends GenericMap {
  minZoom?: number;
  maxZoom?: number;
}
