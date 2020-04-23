import axios from "axios";

import CryptoJS from "crypto-js";
import {Entry} from "./models/Entry";
import {Label} from "./models/Label";
const pbkdf2 = require('pbkdf2');

// Code goes here

// Could be improved, need to understand iv (initialisation vector, and to parsing of keys)
function generateEncryptionKey(password: string): string {
/*    const salt = CryptoJS.lib.WordArray.random(128 / 8);

    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: keySize/32,
        iterations: iterations
    });*/
    return pbkdf2.pbkdf2Sync(password, 'salt', 10000, 32, 'sha512').toString();
  //  return key.toString();
}

export function encrypt (msg: string, key: string) {
    const encrypted = CryptoJS.AES.encrypt(msg, key);

    return encrypted.toString();
}

export function decrypt (encryptedMessage: string, key: string) {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);

    return decrypted.toString(CryptoJS.enc.Utf8);
}

export async function decryptLabelAvatar(label: Label): Promise<Label> {
    if (label.has_avatar && label.avatar_url !== "") {
        if (!Api.encryptionKey) {
            throw new Error("encryption key undefined");
        }
        const avatarContentResp = await axios.get(label.avatar_url);
        label.avatar_url = decrypt(avatarContentResp.data, Api.encryptionKey)
    }
    return label
}

// video about aes https://www.youtube.com/watch?v=O4xNJsjtN6E

//https://github.com/crypto-browserify/pbkdf2
//https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback

export default class Api {

    static token: string | null = process.env.NODE_ENV === "development" ? localStorage.getItem("token"): null;
    static encryptionKey: string | null = process.env.NODE_ENV === "development" ? localStorage.getItem("key") : null;

    static axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_API_URL || "http://localhost:8090",
        headers: {'Content-Type' : 'application/json', "Authorization": "Bearer " + Api.token}
    });
    static register(email: string, pwd: string) {
        return this.axiosInstance.post("/register", {
            email,
            password: pwd
        });
    }

    static async getLabels(name: string = "", excluded_ids: number[], limit: number = 5, page: number = 1) {
        return await this.axiosInstance.get("/labels", {
            params: {
                name,
                limit,
                page,
                excluded_ids: JSON.stringify(excluded_ids)
            }
        });
    }



    static async addLabel(label: Label) {
        return this.axiosInstance.post("/labels", label);
    }

    static async editLabel(label: Label, avatarData: string) {
        const formData = new FormData();
        if (avatarData && avatarData.length > 0) {
            if (!this.encryptionKey) {
                throw new Error("encryption key undefined");
            }
            const file: File = new File([encrypt(avatarData, this.encryptionKey)], "avatar");
            formData.append("avatar", file);
        }
        const cpy = {...label};
        cpy.avatar_url = "";
        formData.append("json", JSON.stringify(cpy));

        const res = await this.axiosInstance.put("/labels/" + label.id, formData);

        if (res.data.label.avatar_url !== "") {
            if (!this.encryptionKey) {
                throw new Error("encryption key undefined");
            }
            const avatarContentResp = await axios.get(res.data.label.avatar_url);
            res.data.label.avatar_url = decrypt(avatarContentResp.data, this.encryptionKey)
        }

        return res;
    }

    static async deleteLabel(label: Label) {
        return this.axiosInstance.delete("/labels/" + label.id);
    }

    static async getEntry(entryId: number | string) {
        if (!this.encryptionKey) {
            throw new Error("encryption key undefined");
        }
        const response = await this.axiosInstance.get("/entries/" + entryId);
        response.data.entry.content = decrypt(response.data.entry.content, this.encryptionKey);
        const promises = [];
        for (const label of response.data.entry.labels as Label[]) {
            promises.push(decryptLabelAvatar(label));
        }
        await Promise.all(promises);
        return response
    }

    static async getEntries(limit?: number, page?: number) {
        return await this.axiosInstance.get("/entries", {
            params: {
                limit,
                page,
            }
        });
    }

    static addEntry(entry: Entry) {
        if (!this.encryptionKey) {
            throw new Error("encryption key undefined");
        }
        entry.content = encrypt(entry.content, this.encryptionKey);
        return this.axiosInstance.post("/entries", entry);
    }

    // expect a decrypted entry
    static editEntry(entry: Entry, labels_id: number[]) {
        if (!this.encryptionKey) {
            throw new Error("encryption key undefined");
        }
        const cloned: Entry = {...entry};
        cloned.content = encrypt(cloned.content, this.encryptionKey);
        return this.axiosInstance.put("/entries/" + entry.id, {
            ...cloned,
            labels_id
        })
    }

    static deleteEntry(entryId: number | string) {
        return this.axiosInstance.delete("/entries/" + entryId)
    }

    static async login(email: string, pwd: string, timeMs: number) {
        const response = await this.axiosInstance.post("/login", {
            email,
            password: pwd,
            session_duration_ms: timeMs
        });
        this.token = response.data.token;
        this.axiosInstance.defaults.headers.Authorization = "Bearer " + this.token;

        this.encryptionKey = generateEncryptionKey(pwd);
        if (process.env.NODE_ENV === "development") {
            localStorage.setItem("token", String(this.token));
            localStorage.setItem("key", String(this.encryptionKey));
        }
    }

    static async getApiKeys() {
        return this.axiosInstance.get("/connectors");
    }
}
