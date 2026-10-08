import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Loads the SVG file at the given URL and inserts it inline in the host element,
 * so that its inner elements can be queried and styled from the DOM.
 * It replaces the unmaintained `ng-inline-svg` package and keeps the same selector.
 */
@Directive({
  selector: '[inlineSVG]'
})
export class InlineSvgDirective implements OnDestroy {

  private subscription: Subscription;

  constructor(private el: ElementRef<HTMLElement>, private http: HttpClient) { }

  @Input()
  set inlineSVG(url: string | undefined) {
    this.subscription?.unsubscribe();
    this.clear();
    if (!url) {
      return;
    }
    this.subscription = this.http.get(url, { responseType: 'text' }).subscribe(
      svgText => this.insert(svgText, url),
      error => console.error(`InlineSvgDirective: unable to load ${url}`, error)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private insert(svgText: string, url: string): void {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const svg = doc.documentElement;
    if (doc.querySelector('parsererror') || svg.nodeName.toLowerCase() !== 'svg') {
      console.error(`InlineSvgDirective: ${url} is not a valid SVG file`);
      return;
    }
    // the file is inserted as live DOM: remove anything that could run code
    svg.querySelectorAll('script').forEach(script => script.remove());
    [svg, ...Array.from(svg.querySelectorAll('*'))].forEach(node => {
      Array.from(node.attributes)
        .filter(attribute => attribute.name.toLowerCase().startsWith('on'))
        .forEach(attribute => node.removeAttribute(attribute.name));
    });
    this.clear();
    this.el.nativeElement.appendChild(this.el.nativeElement.ownerDocument.importNode(svg, true));
  }

  private clear(): void {
    this.el.nativeElement.innerHTML = '';
  }

}
