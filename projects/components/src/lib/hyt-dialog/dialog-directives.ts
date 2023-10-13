import { Directive, Input } from "@angular/core";

@Directive({
    selector: '[hyt-dialog], [hytDialog]',
    host: {
      'class': 'hyt-dialog',
    },
})
export class HytDialogDirective { }

@Directive({
    selector: '[hyt-dialog-header], [hytDialogHeader]',
    host: {
      'class': 'hyt-dialog-header',
    },
})
export class HytDialogTitle { }

@Directive({
    selector: `[hyt-dialog-content], hyt-dialog-content, [hytDialogContent]`,
    host: {
        'class': 'hyt-dialog-content'
    },
})
export class HytDialogContent { }

@Directive({
    selector: `[hyt-dialog-footer], hyt-dialog-footer, [hytDialogFooter]`,
    host: {
      'class': 'hyt-dialog-footer',
      '[class.hyt-dialog-footer-align-start]': 'align === "start"',
      '[class.hyt-dialog-footer-align-center]': 'align === "center"',
    },
})
export class HytDialogFooter {
    @Input() align?: 'start' | 'center' | 'end' = 'end';
}