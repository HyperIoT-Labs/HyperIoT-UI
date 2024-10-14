import { SafeResourceUrl } from "@angular/platform-browser";

export interface BrandingState {
    colorSchema: {
      primaryColor: string;
      secondaryColor: string;
    };
    logo: {
      standard: SafeResourceUrl | string;
      mobile: SafeResourceUrl | string;
    },
    isBrandedTheme: boolean;
    error?: {
      action: string,
      payload: any
    }
};