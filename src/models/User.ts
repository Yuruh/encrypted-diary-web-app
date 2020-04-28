import {DatabaseModel} from "./DatabaseModel";

export class User extends DatabaseModel {
    email: string = "";
    has_registered_otp: boolean = false;
}