# homebridge-windowcover-webapi
Supports window cover devices on HomeBridge Platform

# Requirement
WebAPI can be set the target value like http://WEBSERVICE_API/TERMINATED_BY_SLASH/id/100
*100 is the target value.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-windowcover-webapi
3. Update your configuration file as bellow.

# Configuration

Configuration sample:

 ```
    {
        "bridge": {
            ...
        },
        
        "description": "...",

        "accessories": [
            {
                "accessory": "WindowCover",
                "name": "Window Cover Demo",
                "id": "MAC_ADDRESS_LIKE_12:34:56:78:9A:BC",
                "WebAPIroute": "http://WEBSERVICE_API/TERMINATED_BY_SLASH/",
            }
        ],

        "platforms":[]
    }
```
