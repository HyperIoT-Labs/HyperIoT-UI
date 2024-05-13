import { HPacketField } from "core";
import {FieldType, IRulePart} from "./rule-part.interface";
import { ValidatorFn, Validators } from "@angular/forms";

const validationRules = new Map<HPacketField.TypeEnum, ValidatorFn[]>([
    [HPacketField.TypeEnum.OBJECT, [ Validators.pattern(/^[-]?[.\d]+$/) ]],
    [HPacketField.TypeEnum.INTEGER, [ Validators.pattern("^[-]?[0-9]*$") ]],
    [HPacketField.TypeEnum.FLOAT, [ Validators.pattern(/^[-]?[.\d]+$/) ]],
    [HPacketField.TypeEnum.DOUBLE, [ Validators.pattern(/^[-]?[.\d]+$/) ]],
    [HPacketField.TypeEnum.TEXT, []],
    [HPacketField.TypeEnum.DATE, []],
    [HPacketField.TypeEnum.BOOLEAN, []],
    [HPacketField.TypeEnum.FILE, []],
    [HPacketField.TypeEnum.BYTE, []],
    [HPacketField.TypeEnum.TIMESTAMP, [ Validators.pattern("^[0-9]*$") ]],
]);

export class ValueRulePart implements IRulePart {
    fieldType: FieldType = 'text';
    label = $localize`:@@HYT_value_rule_part_label:Value`;
    validators = [Validators.required ];

    constructor(
        fieldType: HPacketField.TypeEnum,
    ) {
        this.validators = this.validators.concat(validationRules.get(fieldType));
    }

    ruleify = (value: string): string => {
        return value;
    }

    prettify = (value: string): string => {
        return value;
    }
}
