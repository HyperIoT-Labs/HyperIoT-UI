export const EmitAlarm = {
    "data": {
        "name": "Packet_event_alarm",
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
                "packet": 6729,
                "value": {
                    "int": 5
                },
                "id": 6730,
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
                    "string": "{\"specversion\":\"1.0\",\"id\":\"6732\",\"source\":\"http://dashboard-test.hyperiot.cloud/\",\"type\":\"SevUnderZero\",\"data\":{\"severity\":2,\"active\":true,\"alarmName\":\"Integer Under Zero\",\"deviceName\":null,\"deviceId\":6728,\"tags\":[{\"id\":342,\"entityVersion\":1,\"entityCreateDate\":1646316178594,\"entityModifyDate\":1646316178594,\"name\":\"Temperatura Alta\",\"owner\":{\"ownerResourceName\":\"it.acsoftware.hyperiot.hproject\",\"ownerResourceId\":252,\"userId\":0,\"resourceName\":\"it.acsoftware.hyperiot.hproject\"},\"description\":\"\",\"color\":\"#f5360d\"}],\"alarmState\":\"UP\",\"packetIds\":[6729],\"ruleType\":\"ALARM_EVENT\",\"alarmId\":6731,\"ruleName\":\"SevUnderZero\",\"firePayload\":\"\\nPacket:\\n\\tInteger : 5\\n\\ttimestamp : 2024-05-30 08:29:67 +0000\\n\\n\",\"ruleId\":6732,\"fireTimestamp\":1717057796067,\"bundleContext\":null,\"actionName\":\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\"}}"
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
                "packet": 6729,
                "value": {
                    "long": 1717057796067
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
    }
}