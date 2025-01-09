import { inject, Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";


@Injectable({
    providedIn: 'root'
  })

export class PreviousRouteService {
  
    previousUrl: string = '';
    currentUrl: string = '';

    router = inject(Router)

    constructor() {
        this.currentUrl = this.router.url;

        this.router.events.pipe(
            filter((event): event is NavigationEnd=> event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd)=>{
            this.previousUrl = this.currentUrl;
            this.currentUrl = event.url;
        });

    }

}