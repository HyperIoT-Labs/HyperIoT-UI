import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {
  NavCubePlugin,
  OBJLoaderPlugin,
  TreeViewPlugin,
  VBOSceneModel,
  Viewer,
  XKTLoaderPlugin,
} from "@xeokit/xeokit-sdk";
import {fromEvent} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'hyt-bim',
  templateUrl: './bim.component.html',
  styleUrls: ['./bim.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytBimComponent implements OnInit, OnDestroy {

  @Input('pathBim') pathBim: string = '';

  isModelLoaded: boolean = false;

  treeViewContainer?: HTMLElement;
  treeView: TreeViewPlugin;

  viewer: Viewer;
  navCube: NavCubePlugin;
  model: VBOSceneModel;
  xktLoader: XKTLoaderPlugin;

  constructor() { }

  ngOnInit(): void {
    if(this.pathBim && this.pathBim !== ''){

      this.isModelLoaded = true;
      //------------------------------------------------------------------------------------------------------------------
      // Create a VIEWER
      //------------------------------------------------------------------------------------------------------------------

      this.viewer = new Viewer({
        canvasId: "bimCanvas",
        transparent: true
      });

      const boundary = this.viewer.scene.viewport.boundary;
      const bounMaxX = boundary[2];
      console.log('VIEWPORT TOTAL', boundary);
      console.log('VIEWPORT X', bounMaxX);

      //------------------------------------------------------------------------------------------------------------------
      // Camera Settings
      //------------------------------------------------------------------------------------------------------------------

      this.viewer.camera.eye = [-3.933, 2.855, 27.018];
      this.viewer.camera.look = [4.400, 3.724, 8.899];
      this.viewer.camera.up = [-0.018, 0.999, 0.039];

      //------------------------------------------------------------------------------------------------------------------
      // Create a NavCube
      //------------------------------------------------------------------------------------------------------------------

      this.navCube = this.initCubeNav(this.viewer, "navCubeCanvas");

      //------------------------------------------------------------------------------------------------------------------
      // Create an IFC structure tree view
      //------------------------------------------------------------------------------------------------------------------
      this.treeViewContainer = document.getElementById("treeViewContainer")!;
      this.treeView = new TreeViewPlugin(this.viewer, {
        containerElement: this.treeViewContainer,
        autoExpandDepth: 1, // Initially expand tree three storeys deep
        hierarchy: "containment"
      });

      // load plugin for XKT model
      this.xktLoader = new XKTLoaderPlugin(this.viewer);

      // Placeholder XKT

      this.model = this.initLoaderModel(this.xktLoader, this.pathBim);

      this.model.on("loaded", () => {
        this.viewer.cameraFlight.duration = .8;
        this.viewer.cameraFlight.flyTo(this.model);
        /*viewer.cameraControl.on('hover', (pickResult) => {
          console.log('PICKRES', pickResult)
        })*/
      });
      this.model.on('error', (err) => {console.log('ERROR', err)});

    } else {
      // No input file
      this.isModelLoaded = false;
    }

  }

  ngOnDestroy() {
    const model = this.viewer.scene.models['Loader'];
    model.destroy();
    this.treeView.destroy();
    this.navCube.destroy();
    this.viewer.destroy();
    console.log('%c[BIM COMPONENT] ON DESTROY')
  }

  initCubeNav(viewer: Viewer, canvasId: string): NavCubePlugin {
    return new NavCubePlugin(viewer, {
      canvasId: canvasId,

      visible: true,         // Initially visible (default)

      cameraFly: 'true',       // Fly camera to each selected axis/diagonal
      cameraFitFOV: '45',      // How much field-of-view the scene takes once camera has fitted it to view
      cameraFlyDuration: '0.5',// How long (in seconds) camera takes to fly to each new axis/diagonal

      fitVisible: false,     // Fit whole scene, including invisible objects (default)

      synchProjection: false // Keep NavCube in perspective projection, even when camera switches to ortho (default)
    });
  }

  initLoaderModel(xktLoader: XKTLoaderPlugin, pathBim: string){
    return xktLoader.load({
      id: "Loader",
      edges: true,
      src: pathBim,
      excludeUnclassifiedObjects: false,
    });
  }

}
