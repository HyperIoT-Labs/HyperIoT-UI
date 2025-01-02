import { brandingReducer } from "../branding/branding.reducer";
import { hDevicesReducer } from "../hDevices/hDevices.reducer";
import { hPacketsReducer } from "../hPackets/hPackets.reducer";
import { hProjectsReducer } from "../hProjects/hProjects.reducer";
import { rulesReducer } from "../rules/rules.reducer";

export const STORE = {
    branding: brandingReducer,
    rules: rulesReducer,
    hProjects: hProjectsReducer,
    hDevices: hDevicesReducer,
    hPackets: hPacketsReducer,
}