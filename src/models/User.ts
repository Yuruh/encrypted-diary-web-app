import {DatabaseModel} from "./DatabaseModel";

export class User extends DatabaseModel {
    email: string = "";
    has_registered_otp: boolean = false;
    two_factors_cookies: TwoFactorsCookies[] = []
}

export class TwoFactorsCookies extends DatabaseModel {
//    uuid: string = "" uuids should be secret
    ip_addr: string = "";
    user_agent: string = "";
    expires: Date = new Date();
    last_used: Date = new Date();

}