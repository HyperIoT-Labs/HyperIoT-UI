import { brandingReducer } from "../branding/branding.reducer";
import { Branding } from "./models/branding";

export interface StoreModel {
    branding: Branding
}

export const STORE = {
    branding: brandingReducer
}