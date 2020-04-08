import {DatabaseModel} from "./DatabaseModel";
import {Label} from "./Label";

export class Entry extends DatabaseModel {
    content: string = "";
    title: string = "";
    labels: Label[] = [];
}