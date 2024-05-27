import fetch from 'node-fetch';

export default class CommunicationController {
    static BASE_URL = "https://develop.ewlab.di.unimi.it/mc/mostri/";

    static async genericRequest(endpoint, verb, queryParams, bodyParams) {
        const queryParamsFormatted = new URLSearchParams(queryParams).toString();
        const url = this.BASE_URL + endpoint + "?" + queryParamsFormatted;
        //console.log("sending " + verb + " request to: " + url);
        let fatchData = {
            method: verb,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        };
        if (verb != 'GET') {
            fatchData.body = JSON.stringify(bodyParams);
        }
        let httpResponse = await fetch(url, fatchData);

        const status = httpResponse.status;
        if (status == 200) {
            let deserializedObject = await httpResponse.json();
            //console.log("Response: " + JSON.stringify(deserializedObject));
            return deserializedObject;
        } else {
            //console.log(httpResponse);
            const message = await httpResponse.text();
            let error = new Error("Error message from the server. HTTP status: " + status + " " + message);
            throw error;
        }
    }

    static async register() {
        const endPoint = "users/";
        const verb = 'POST';
        const queryParams = {};
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async activateObject(sid, uid) {
        const endPoint = "objects/" + uid + '/activate/';
        const verb = 'POST';
        const queryParams = {};
        const bodyParams = { sid: sid};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }
    
    static async getUser(sid, uid) {
        const endPoint = "users/" + uid;
        const verb = 'GET';
        const queryParams = { sid: sid };
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams); 
    }

    static async getObject(sid, uid) {
        const endPoint = "objects/" + uid;
        const verb = 'GET';
        const queryParams = { sid: sid };
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams); 
    }

    static async getUsers(sid, lat, lon) {
        const endPoint = "users/";
        const verb = 'GET';
        const queryParams = { sid: sid, lat: lat, lon: lon };
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getRanking(sid) {
        const endPoint = "ranking/";
        const verb = 'GET';
        const queryParams = { sid: sid };
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async getObjects(sid, lat, lon) {
        const endPoint = "objects/";
        const verb = 'GET';
        const queryParams = { sid: sid, lat: lat, lon: lon };
        const bodyParams = {};
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async modifyUserPositionShare(sid, uid, positionshare) {
        const endPoint = "users/" + uid;
        const verb = 'PATCH';
        const queryParams = {};
        const bodyParams = { sid: sid, positionshare: positionshare };
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async modifyUserProfilePicture(sid, uid, picture) {
        const endPoint = "users/" + uid;
        const verb = 'PATCH';
        const queryParams = {};
        const bodyParams = { sid: sid, picture: picture };
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

    static async modifyUserName(sid, uid, name) {
        const endPoint = "users/" + uid;
        const verb = 'PATCH';
        const queryParams = {};
        const bodyParams = { sid: sid, name: name };
        return await CommunicationController.genericRequest(endPoint, verb, queryParams, bodyParams);
    }

}