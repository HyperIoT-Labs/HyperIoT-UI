export namespace DashboardEvent {
  export enum Timeline {
    REFRESH = "refresh",
    RESET = "reset",
    NEW_RANGE = "newRange",
  }

  export enum Command {
    PLAY = "play",
    PAUSE = "pause",
    STOP = "stop",
    RUN = "run",
  }

  // Model for extractDataFromUrl function in DashboardEventService
  export interface ExtractDataFromUrl {
    type: string;
    id: string;
  }
}
