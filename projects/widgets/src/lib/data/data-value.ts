/**
 * 
 */
export class DataValue {
    
    constructor(private value:string,private name:string,private unit:string){}

    getValue():string {
        return this.value;
    }

    getName():string {
        return this.name;
    }

    getUnit():string {
        return this.unit;
    }

}
