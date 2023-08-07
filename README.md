# Hyperiot-app

HyperIoT Front End Angular Application is a project that includes all tools necessary to manage IoT and BigData projects through hyperiot platform and to access realtime and offline data through a dashboard.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.13.

Node v16 and Angular CLI are required to run this project.

## Getting Started

The following instructions provide a step-by-step guide for setting up and developing Hyperiot-app locally.

### Install dependencies

use `npm install` to install project dependencies

### Libraries Build

HyperIoT-app relies on `core`, `components` and `widets` libraries. Before running the application it is necessary to build the libraries with the command `ng build <library-name>`
> Note: Libraries should be build in the following order: core, components, widgets

> Note: `npm run build-libs` can be used to build the libraries sequentially

### Hyperiot Services

The application requires backend services for most of its functions. For development purposes, it is possible to use Docker to start the services locally by following the procedure below.

- Install Docker
- Login to acsoftware registry with `docker login https://nexus.acsoftware.it:18079` using the following credentials:
```sh
username: hyperiot-read-user
password: hyperiot-read-user
```
- Run `docker-compose -f compose/docker-compose-svil-microservices-only.yml up`
- You can now divert the requests of your application to your local hyperiot services using `proxy-local.config.json` file.

> Note: docker-compose-svil-microservices-only will start zookeeper, postgresql and karaf-microservices only. If additional services need to be launched, it is possible to modify the compose file or create a new one

> Note: Data streaming will not work with the basic configuration

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Proxy

Use the `--proxy-config` option to specify a proxy configuration file (e.g. `ng serve --proxy-config proxy-local.config.json`)
Refer to the [Angular proxy documentation](https://angular.io/guide/build#proxying-to-a-backend-server) for additional info.

> Note: Use `npm start` (or `ng serve --proxy-config proxy-local.config.json`) to start the application that proxies calls to your local services.

### Internationalization

The project is designed to support multiple locales. Current available locales are english (default) and italian.
Use the `--configuration` option to start the application with a specified locale. (e.g. `ng serve --configuration it`).
Refer to the [Angular internationalization documentation](https://angular.io/guide/i18n-overview) to add new locales or for additional info.

> Note: The build using localization might fail due to a [known issue](https://github.com/angular/angular/issues/44004). To resolve the error, remove the `node_modules\.cache` folder before launching the build.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## License

Apache 2.0 License (click [here](./License.MD) to see license information.)
