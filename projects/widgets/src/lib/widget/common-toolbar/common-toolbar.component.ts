import {
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

@Component({
    selector: 'hyperiot-common-toolbar',
    templateUrl: './common-toolbar.component.html',
    styleUrls: ['./common-toolbar.component.scss']
})
export class CommonToolbarComponent {
    @Input() widgetName: string;

    @Input() config = {
        showClose: true,
        showSettings: true,
        showPlay: false,
        showRefresh: false,
        showTable: false,
        hideFullScreen: false
    }

    @Input() toolbarIsVisible: boolean = true;

    @Output() action = new EventEmitter<string>();

    isPaused: boolean;
    showTable: boolean;
    isDisabled: boolean;

    constructor() {
        this.isPaused = false;
        this.isDisabled = false;
    }

    onPlayPause() {
        if (this.isPaused) {
            this.action.emit('toolbar:play');
        } else {
            this.action.emit('toolbar:pause');
        }

        this.isPaused = !this.isPaused;
    }

    /**
     * This method tells if the toolbar is in play mode 
     * @param play Whether to play or pause the data
     */
    play(play: boolean) {
        if (play) {
            this.action.emit('toolbar:play');
        } else {
            this.action.emit('toolbar:pause');
        }

        this.isPaused = !play;
        this.isDisabled = !play;
    }

    onTableView() {
        if (this.showTable) {
            this.action.emit('toolbar:chart');
        } else {
            this.action.emit('toolbar:table');
        }

        this.showTable = !this.showTable;
    }

    onRefresh() {
        this.action.emit('toolbar:refresh');
    }

    onSettings() {
        this.action.emit('toolbar:settings');
    }

    onDrag() {
        this.action.emit('toolbar:drag');
    }

    onClose() {
        this.action.emit('toolbar:close');
    }
    onFullScreen() {
        this.action.emit('toolbar:fullscreen');
    }
}
