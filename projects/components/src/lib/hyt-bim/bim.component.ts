import {AfterViewInit, Component, HostListener, Input, OnInit, ViewEncapsulation} from '@angular/core';
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
export class HytBimComponent implements OnInit, AfterViewInit {

  @Input('pathBim') pathBim: string = '';

  isModelLoaded: boolean = false;

  treeViewContainer?: HTMLElement;

  viewer: Viewer;
  //navCube: any;
  model: VBOSceneModel;
  xktLoader: XKTLoaderPlugin;

  constructor() { }

  ngOnInit(): void {
    if(this.pathBim && this.pathBim !== ''){

      this.isModelLoaded = true;
      //------------------------------------------------------------------------------------------------------------------
      // Create a VIEWER
      //------------------------------------------------------------------------------------------------------------------

      /*const viewer = new Viewer({
        canvasId: "bimCanvas",
        transparent: true
      });*/

      this.viewer = new Viewer({
        canvasId: "bimCanvas",
        transparent: true
      });

      /*const boundary = viewer.scene.viewport.boundary;
      const bounMaxX = boundary[2];
      console.log('VIEWPORT TOTAL', boundary);
      console.log('VIEWPORT X', bounMaxX);*/

      //------------------------------------------------------------------------------------------------------------------
      // Camera Settings
      //------------------------------------------------------------------------------------------------------------------

      this.viewer.camera.eye = [-3.933, 2.855, 27.018];
      this.viewer.camera.look = [4.400, 3.724, 8.899];
      this.viewer.camera.up = [-0.018, 0.999, 0.039];

      //------------------------------------------------------------------------------------------------------------------
      // Create a NavCube
      //------------------------------------------------------------------------------------------------------------------

      /*new NavCubePlugin(this.viewer, {
       canvasId: "navCubeCanvas",

        visible: true,         // Initially visible (default)

        cameraFly: 'true',       // Fly camera to each selected axis/diagonal
        cameraFitFOV: '45',      // How much field-of-view the scene takes once camera has fitted it to view
        cameraFlyDuration: '0.5',// How long (in seconds) camera takes to fly to each new axis/diagonal

        fitVisible: false,     // Fit whole scene, including invisible objects (default)

        synchProjection: false // Keep NavCube in perspective projection, even when camera switches to ortho (default)
      });*/

      //this.navCube = this.initCubeNav(this.viewer, "navCubeCanvas");

      //------------------------------------------------------------------------------------------------------------------
      // Create an IFC structure tree view
      //------------------------------------------------------------------------------------------------------------------
      this.treeViewContainer = document.getElementById("treeViewContainer")!;
      const treeView = new TreeViewPlugin(this.viewer, {
        containerElement: this.treeViewContainer,
        autoExpandDepth: 1, // Initially expand tree three storeys deep
        hierarchy: "containment"
        //hierarchy: "types",
      });

      // load plugin for XKT model
      this.xktLoader = new XKTLoaderPlugin(this.viewer);

      // load plugin for OBJ model
      //const objLoader = new OBJLoaderPlugin(this.viewer, {id: 'testLoader'});

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

  ngAfterViewInit() {

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
      id: "ProGet",
      edges: true,
      //src: '/assets/xkt-placeholder/HousePlan.xkt',
      //src: '/assets/xkt-placeholder/storey.xkt',
      src: pathBim,
      excludeUnclassifiedObjects: false,
    });
  }

}
