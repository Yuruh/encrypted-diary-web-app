import { DatabaseModel } from "./DatabaseModel";
const randomColor = require('randomcolor');

export class Label extends DatabaseModel {
    name: string = "";
    color: string = randomColor({
        luminosity: 'light',
    });
    avatar_url: string = ""
}