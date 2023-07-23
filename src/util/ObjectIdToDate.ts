import {Types} from "mongoose";

export default function (objectId : Types.ObjectId) {
    return new Date(parseInt(String(objectId).substring(0, 8), 16) * 1000);
};