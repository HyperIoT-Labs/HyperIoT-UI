import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  AnnotationsPlugin,
  NavCubePlugin,
  OBJLoaderPlugin,
  TreeViewPlugin,
  VBOSceneModel,
  Viewer,
  XKTLoaderPlugin,
} from "@xeokit/xeokit-sdk";
import {Area, Logger, LoggerService} from "core";
import {Router} from "@angular/router";

@Component({
  selector: 'hyt-bim',
  templateUrl: './bim.component.html',
  styleUrls: ['./bim.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytBimComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Input variable with the file path to display the BIM model
   */
  @Input('pathBim') pathBim: string = '';
  @ViewChild('bimContainer') bimContainer!: ElementRef;
  /**
   * Input variable that tell us if the BIM model is in Edit mode or not
   */
  @Input('editMode') editMode: boolean = false;
  @Input('currentAreaConfiguration') currentAreaConfiguration: string;
  @Input('projectId') projectId: number;
  @Input('areaId') areaId: number;
  /**
   * Value that defines if the model is loaded
   */
  isModelLoaded: boolean = false;
  /**
   * Reference to the HTML element that will contain the BIM layers.
   */
  treeViewContainer?: HTMLElement;
  /**
   * Object that will contain the layers extracted from the BIM model
   */
  treeView: TreeViewPlugin;
  /**
   * Reference to the canvas where to draw the model
   */
  viewer: Viewer;
  /**
   * Object that will contain the navigation cube
   */
  navCube: NavCubePlugin;
  /**
   * Object that will be responsible for rendering the model
   */
  model: VBOSceneModel;
  /**
   * Loader of the XKT model
   */
  xktLoader: XKTLoaderPlugin;
  objLoader: OBJLoaderPlugin;
  annotations: AnnotationsPlugin;
  checklistener: boolean = false;
  buildingsDummyData = [
    {
      file: 'PonteTestPresentazione.xkt',
      id: '',
      objects: [
        {
          id: "genericSensorObject_1",
          src: "/assets/sensors-obj/Sensore_Colored.obj",
          position: [147.4566717295942, 14.427753634100707, 2.1091194968707754],
          scale: [1, 1, 1],
          rotation: [0, 330, 0],
        },
      ],
      annotations: [
        {
          id: "annotation_sensor_1",
          worldPos: [147.4966717295942, 14.427753634100707, 2.1091194968707754],
          occludable: false,
          markerShown: true,
          labelShown: false,
          values: {
            glyph: "A1",
            title: "Structural Accelerometer",
            description: "Monitors bridge vibrations and movements",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0,
            deviceId: 8037,
          }
        },
      ],
    },
    {
      file: 'SanLazzaro_v3.new.xkt',
      id: '',
      objects: [
        {
          id: "genericSensorObject_1",
          src: "/assets/sensors-obj/Sensore_Colored.obj",
          position: [-5.880494179184371, 2.2549079430681127, -16.612405162248685],
          scale: [1, 1, 1],
          rotation: [0, -90, 0],
        },
        {
          id: "genericSensorObject_2",
          src: "/assets/sensors-obj/Sensore_Colored.obj",
          position: [-7.007360015156518, 4.499422857183059, 13.607612962438509],
          scale: [1, 1, 1],
          rotation: [0, -90, 0]
        }
      ],
      annotations: [
        {
          id: "annotation_sensor_1",
          worldPos: [-5.980494179184371, 2.2549079430681127, -16.612405162248685],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Potentiometer",
            description: "Crack SC-4 (attic) first floor",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/potenziometro.png',
            projectId: 0,
            areaId: 0,
            deviceId: 8075,
          }
        },
        {
          id: "annotation_sensor_2",
          worldPos: [-7.107360015156518, 4.499422857183059, 13.607612962438509],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A2",
            title: "Strain gauge",
            description: "Crack 104-7 (vertical) second floor",
            markerBGColor: "transparent",
            sensorImgUrl: "/assets/images/sensors/Estensimetro.png",
            projectId: 0,
            areaId: 0,
            deviceId: 8078,
          }
        }
      ],

    },
    {
      file: 'PALO-2bo0072ter-R10.ifc.xkt',
      id: '',
      objects: [
        {
          id: "genericSensorObject_1",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [-3.7235319437408374, 26.066913122778967, 0.6789571027975883],
          scale: [1, 1, 1],
          rotation: [0, -45, 0],
        },
      ],
      annotations: [
        {
          id: "annotation_sensor_1",
          worldPos: [-3.8235319437408374, 26.066913122778967, 0.6789571027975883],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Temperature",
            description: "Outdoor temperature acquisition",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/temperature.jpeg',
            projectId: 0,
            areaId: 0
          }
        },
      ]
    },
    {
      file: 'Ponte_Tekla_Structures.ifc.xkt',
      id: '',
      objects: [
        {
          id: "genericSensorObject_1",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [8.9346357674826, 1.1249794488726916, -12.697565937167525],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_2",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [30.59910147996385, 1.12501828970645, -12.510614517181242],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_3",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [40.59236858272003, 1.124954481880641, -12.487635444804507],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_4",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [54.624901741556556, 1.1240889422458231, -12.296994564624264],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_5",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [69.95060511776063, 1.1251176646983545, -12.27917176443749],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_6",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [7.2386025877012585, 1.1232908266559445, -1.0358537242972767],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_7",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [28.599440357093556, 1.1243140339374005, -0.6712015102061306],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_8",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [38.600610346568395, 1.1244581780283465, -1.008260207728168],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_9",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [52.587006951360344, 1.1239221141773221, -0.8555207776151823],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
        {
          id: "genericSensorObject_10",
          src: "/assets/sensors-obj/Sensori_HYOT.obj",
          position: [68.28925678443431, 1.1250505901965475, -0.667016672526767],
          scale: [1, 1, 1],
          rotation: [90, 180, 180],
        },
      ],
      annotations: [
        {
          id: "annotation_sensor_1",
          worldPos: [8.9346357674826, 1.2249794488726916, -12.697565937167525],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 313",
            description: "Setup_3",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_2",
          worldPos: [30.59910147996385, 1.22501828970645, -12.510614517181242],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 317",
            description: "Setup_4",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_3",
          worldPos: [40.59236858272003, 1.224954481880641, -12.487635444804507],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 321",
            description: "Setup_5",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_4",
          worldPos: [54.624901741556556, 1.2240889422458231, -12.296994564624264],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 325",
            description: "Setup_6",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_5",
          worldPos: [69.95060511776063, 1.2251176646983545, -12.27917176443749],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 329",
            description: "Setup_7",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_6",
          worldPos: [7.2386025877012585, 1.2232908266559445, -1.0358537242972767],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 113",
            description: "Setup_3",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_7",
          worldPos: [28.599440357093556, 1.2243140339374005, -0.6712015102061306],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 117",
            description: "Setup_4",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_8",
          worldPos: [38.600610346568395, 1.2244581780283465, -1.008260207728168],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 121",
            description: "Setup_5",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_9",
          worldPos: [52.587006951360344, 1.2239221141773221, -0.8555207776151823],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 125",
            description: "Setup_6",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
        {
          id: "annotation_sensor_10",
          worldPos: [68.28925678443431, 1.2250505901965475, -0.667016672526767],
          occludable: true,
          markerShown: true,
          labelShown: false,

          values: {
            glyph: "A1",
            title: "Sensor 129",
            description: "Setup_7",
            markerBGColor: "transparent",
            sensorImgUrl: '/assets/images/sensors/acc_ponte.jpg',
            projectId: 0,
            areaId: 0
          }
        },
      ]
    }
  ]

  /*
   * logger service
   */
  private logger: Logger;

  constructor(
    private loggerService: LoggerService,
    private router: Router
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('BimComponent');
  }

  ngOnInit(): void {
    if(this.pathBim && this.pathBim !== ''){
      console.log('CURRENT AREA DECODED', JSON.parse(this.currentAreaConfiguration));
      this.isModelLoaded = true;
      //------------------------------------------------------------------------------------------------------------------
      // Create a VIEWER
      //------------------------------------------------------------------------------------------------------------------
      this.viewer = this.initViewer('bimCanvas');

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
      this.treeView = this.initTreeViewElement('treeViewContainer');

      // load plugin for XKT model
      this.xktLoader = new XKTLoaderPlugin(this.viewer);

      //------------------------------------------------------------------------------------------------------------------
      // Create an IFC structure tree view
      //------------------------------------------------------------------------------------------------------------------
      this.objLoader = this.initObjLoader(this.viewer);

      this.model = this.initLoaderModel(this.xktLoader, this.pathBim);

      this.model.on("loaded", () => {
        this.logger.debug('BIM model loaded correctly');
        this.viewer.cameraFlight.duration = .8;
        this.viewer.cameraFlight.flyTo(this.model);
        /*viewer.cameraControl.on('hover', (pickResult) => {
          console.log('PICKRES', pickResult)
        })*/
        // SET DUMMY DATA
        this.setDummyData(this.currentAreaConfiguration);
      });
      this.model.on('error', (err) => {
        this.isModelLoaded = false;
        this.logger.error('Load BIM model error', err);
      });

    } else {
      // No input file
      this.isModelLoaded = false;
    }

  }

  ngAfterViewInit() {
    //------------------------------------------------------------------------------------------------------------------
    // Create an AnnotationsPlugin, with which we'll create annotations
    //------------------------------------------------------------------------------------------------------------------
    if(this.viewer){
      this.annotations = this.initAnnotations(this.bimContainer.nativeElement);
      console.log('ANNOTATIONS INIT');
    }
  }

  ngOnDestroy() {
    this.destroyAll();
  }

  initTreeViewElement(treeViewContainerId: string): TreeViewPlugin {
    this.treeViewContainer = document.getElementById(treeViewContainerId)!;
    return new TreeViewPlugin(this.viewer, {
      containerElement: this.treeViewContainer,
      autoExpandDepth: 1, // Initially expand tree three storeys deep
      hierarchy: "containment"
    });
  }
  /**
   *  Initialization of the model navigation cube based on the reference viewer and the id of the canvas tag where to draw it
   * @param viewer
   * @param canvasId
   */
  initCubeNav(viewer: Viewer, canvasId: string): NavCubePlugin {
    this.logger.debug('initCubeNav for this canvasId', canvasId);
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

  /**
   * Initializing the model loader by passing it the path to the file to be processed
   * @param xktLoader
   * @param pathBim
   */
  initLoaderModel(xktLoader: XKTLoaderPlugin, pathBim: string): VBOSceneModel {
    this.logger.debug('initLoaderModel for this path', pathBim);
    return xktLoader.load({
      id: "Loader",
      edges: true,
      src: pathBim,
      excludeUnclassifiedObjects: false,
    });
  }

  /**
   * Initialization of drawing area based on canvas tag id
   * @param canvasId
   */
  initViewer(canvasId: string): Viewer {
    this.logger.debug('initViewer for this canvasId', canvasId);
    return new Viewer({
      canvasId: canvasId,
      transparent: true
    });
  }

  initObjLoader(viewer: Viewer): OBJLoaderPlugin {
    console.log('INIT OBJ LOADER');
    return new OBJLoaderPlugin(viewer, {id: 'objLoader'});
  }

  /**
   * Destroys every element of BIM
   */
  destroyAll(){
    if(this.viewer){
      console.log('DESTROY ALL');
      const model = this.viewer.scene.models['Loader'];
      model.destroy();
      this.treeView.destroy();
      this.navCube.destroy();
      this.viewer.destroy();
      this.annotations.destroy();
      this.logger.debug('destroyAll destroy all elements on canvas');
    } else {
      console.log('NO DESTROY ALL')
    }

  }

  initAnnotations(container: HTMLElement): AnnotationsPlugin {
    return new AnnotationsPlugin(this.viewer, {

      markerHTML: "<div class='annotation-marker' style='background-color: {{markerBGColor}};'>{{glyph}}</div>",
      labelHTML: "<div class='annotation-label' style='background-color: {{labelBGColor}};'>\
            <div class='annotation-title'>{{title}}</div>\
            <div class='annotation-desc'>{{description}}</div>\
            \<div class='container-annotation-columns'>\
                <div class='container-annotation-image annotation-column'>\
                    <div id='annotation-image-title' class='annotation-column-title'>sensor image</div>\
                    <div class='annotation-img-box'>\
                        <img alt='myImage' class='annotation-img' src='{{sensorImgUrl}}'>\
                    </div>\
                </div>\
                <div class='container-annotation-data annotation-column'>\
                    <div class='annotation-data'>\
                      <a class='goToDash' href='/hdevice/{{projectId}}/{{deviceId}}/dashboards'>Go to dashboard <span>&#x3e;</span></a>\
                    </div>\
                </div>\
            </div>\
            </div>",
      container: container,

      values: {
        markerBGColor: "red",
        labelBGColor: "white",
        glyph: "X",
        title: "Untitled",
        description: "No description",
        sensorImgUrl: 'cc',
        projectId: 0,
        areaId: 0,
        deviceId: 0,
      }
    });
  }

  setDummyData(areaConfiguration: string){
    console.log('AREA CONFIGURATION', JSON.parse(areaConfiguration));
    const jsonAreaConfiguration = JSON.parse(areaConfiguration);
    const fileName = jsonAreaConfiguration.bimInfo.name;
    let dummyData = this.buildingsDummyData.find(item=> item.file === fileName);
    if(dummyData){
      console.log('SET DUMMY DATA', dummyData);
      this.setObjOnModel(this.objLoader, dummyData.objects);
      this.setAnnotationOnModel(this.annotations, dummyData.annotations)
    }
  }

  setObjOnModel(objLoader:OBJLoaderPlugin, objArray: any[]){
    for(let obj of objArray){
      objLoader.load({ // Returns an Entity that will be registered on Viewer#scene#models
        id: obj.id,
        src: obj.src,
        position: obj.position,
        scale: obj.scale,
        rotation: obj.rotation
      });
    }
  }

  setAnnotationOnModel(annotations: AnnotationsPlugin, annotationArray: any[]){
    for (let annotation of annotationArray) {
      annotations.createAnnotation({
        id: annotation.id,
        worldPos: annotation.worldPos,
        occludable: annotation.occludable,
        markerShown: annotation.markerShown,
        labelShown: annotation.labelShown,

        values: {
          glyph: annotation.values.glyph,
          title: annotation.values.title,
          description: annotation.values.description,
          markerBGColor: annotation.values.markerBGColor,
          sensorImgUrl: annotation.values.sensorImgUrl,
          projectId: this.projectId,
          areaId: this.areaId,
          deviceId: annotation.values.deviceId,
        }
      });

    }
    // Set listener on mouse click
    this.viewer.scene.input.on("mouseclicked", (coords: any) => {
      const pickResult = this.viewer.scene.pick({
        canvasPos: coords,
        pickSurface: true  // <<------ This causes picking to find the intersection point on the entity
      });
      if(pickResult){
        console.log('pickResult MYPICK', pickResult);
        const entityId = pickResult.entity.id.toString();
        if(entityId.includes("generic")){
          const entityArr = entityId.split(/[#_]+/);
          const entityName = entityArr[0];
          const entityNumber = entityArr[1];
          console.log('pickResult INFO NAME ', entityName, 'INFO NUMBER', entityNumber);
          const annotationName = 'annotation_sensor_' + entityNumber;
          const annotation = this.annotations.annotations[annotationName];
          if(!this.checklistener){
            this.checklistener = true;
            // Removed. Now link redirects to device dashboard
            /* const goToDashBoxes = document.querySelectorAll('.goToDash');
            for (let i = 0; i < goToDashBoxes.length ; i++) {
              goToDashBoxes[i].addEventListener('click', () => {
                this.goToAreaDashboard();
              })
            } */
          }
          annotation.setLabelShown(!annotation.getLabelShown());
        } else {
          console.log('NO pickResult ANNOTATIONS', this.annotations);
        }

      }else{
        console.log('NO pickResult MYPICK', pickResult);
      }
    });
  }

  goToAreaDashboard() {
    this.router.navigate(['areas', this.projectId, this.areaId, 'dashboards']);
  }

}
