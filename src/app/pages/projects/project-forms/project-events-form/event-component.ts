/**
 * This interface generalizes the EventComponent
 */
export interface EventComponent {
    getId():string
    //method for resetting the event component
    reset():void;
    //method for setting required data from component
    setData(data:Array<String>):void;
    //return the json action
    buildJsonAction():string;
    //return validation boolean
    isInvalid():boolean;
    //return true if changes have not been saved
    isDirty():boolean;
}
