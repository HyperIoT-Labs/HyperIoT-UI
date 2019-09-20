import { ProjectDetailComponent } from './project-detail.component';

export interface ProjectDetailEntity {
    isProjectEntity: boolean;
    treeHost: ProjectDetailComponent;
    save(successCallback: any, errorCallback: any): void;
    delete(successCallback: any, errorCallback: any): void;
    isDirty(): boolean;
    isValid(): boolean;
}
