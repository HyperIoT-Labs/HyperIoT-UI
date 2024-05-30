import { HytAlarm } from "./hyperiot-alarm.model";

export const alarmMocked : HytAlarm.LiveAlarm = {
    "color": {
        "background": "#bd362f",
        "text": "#fff"
    },
    "event": {
        "severity": 2,
        "active": true,
        "alarmName": "Allarme Fucsia",
        "deviceName": null,
        "deviceId": 6089,
        "tags": [
            {
                "id": 4642,
                "entityVersion": 1,
                "entityCreateDate": new Date(1703774538387),
                "entityModifyDate": new Date(1703774538387),
                "name": "test-vane",
                "owner": {
                    "ownerResourceName": "it.acsoftware.hyperiot.hproject",
                    "ownerResourceId": 4414,
                    "userId": 0,
                    "resourceName": "it.acsoftware.hyperiot.hproject"
                },
                "description": "",
                "color": "#a52265"
            }
        ],
        "alarmState": "UP",
        "packetIds": [
            6090
        ],
        "ruleType": "ALARM_EVENT",
        "alarmId": 6432,
        "ruleName": "SeveritySevera",
        "firePayload": "\nPacketIntensive:\n\tNotInteger : 14.788138405008226\n\tInteger : 99\n\ttimestamp : 2024-05-15 08:33:296 +0000\n\n",
        "ruleId": 6433,
        "fireTimestamp": 1715853971017,
        "bundleContext": null,
        "actionName": "it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction"
    },
    "packet": {
        "entityVersion": 12132133131231,
        "name": "PacketIntensive_event_alarm",
        "type": "OUTPUT",
        "format": null,
        "serialization": null,
        "device": 0,
        "version": null,
        "fields": {
            "Integer": {
                "name": "Integer",
                "description": null,
                "type": "INTEGER",
                "multiplicity": "SINGLE",
                "packet": 6090,
                "value": {
                    "int": 99
                },
                "id": 6091,
                "categoryIds": [],
                "tagIds": []
            },
            "NotInteger": {
                "name": "NotInteger",
                "description": null,
                "type": "DOUBLE",
                "multiplicity": "SINGLE",
                "packet": 6090,
                "value": {
                    "double": 14.788138405008226
                },
                "id": 6523,
                "categoryIds": [],
                "tagIds": []
            },
            "event": {
                "name": "event",
                "description": null,
                "type": "TEXT",
                "multiplicity": "SINGLE",
                "packet": 0,
                "value": {
                    "string": "{\"specversion\":\"1.0\",\"id\":\"6433\",\"source\":\"http://dashboard-test.hyperiot.cloud/\",\"type\":\"SeveritySevera\",\"data\":{\"severity\":2,\"active\":true,\"alarmName\":\"Allarme Fucsia\",\"deviceName\":null,\"deviceId\":6089,\"tags\":[{\"id\":4642,\"entityVersion\":1,\"entityCreateDate\":1703774538387,\"entityModifyDate\":1703774538387,\"name\":\"test-vane\",\"owner\":{\"ownerResourceName\":\"it.acsoftware.hyperiot.hproject\",\"ownerResourceId\":4414,\"userId\":0,\"resourceName\":\"it.acsoftware.hyperiot.hproject\"},\"description\":\"\",\"color\":\"#a52265\"}],\"alarmState\":\"UP\",\"packetIds\":[6090],\"ruleType\":\"ALARM_EVENT\",\"alarmId\":6432,\"ruleName\":\"SeveritySevera\",\"firePayload\":\"\\nPacketIntensive:\\n\\tNotInteger : 14.788138405008226\\n\\tInteger : 99\\n\\ttimestamp : 2024-05-15 08:33:296 +0000\\n\\n\",\"ruleId\":6433,\"fireTimestamp\":1715762033296,\"bundleContext\":null,\"actionName\":\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\"}}"
                },
                "id": 0,
                "categoryIds": [],
                "tagIds": []
            },
            "timestamp": {
                "name": "timestamp",
                "description": null,
                "type": "TIMESTAMP",
                "multiplicity": "SINGLE",
                "packet": 6090,
                "value": {
                    "long": 1715762033296
                },
                "id": 0,
                "categoryIds": [],
                "tagIds": []
            }
        },
        "valid": false,
        "id": 0,
        "categoryIds": [],
        "tagIds": [],
        "timestampField": "timestamp",
        "timestampFormat": "dd/MM/yyyy hh.mmZ",
        "trafficPlan": "LOW",
        "unixTimestamp": true,
        "unixTimestampFormatSeconds": false
    },
    "isEvent": false,
    "isAlarm": true
};