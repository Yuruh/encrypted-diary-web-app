import axios from "axios";

import CryptoJS, {WordArray} from "crypto-js";
const pbkdf2 = require('pbkdf2');


// Code goes here
const keySize = 256;
const iterations = 100;

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

function encrypt (msg: string, key: string) {
    const encrypted = CryptoJS.AES.encrypt(msg, key);

    return encrypted.toString();
}

function decrypt (encryptedMessage: string, key: string) {
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);

    return decrypted.toString(CryptoJS.enc.Utf8);
}

//https://github.com/crypto-browserify/pbkdf2
//https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
function taast() {
    const keyA = generateEncryptionKey("pwd");
    const eazr = encrypt("message", keyA);
    const keyB = generateEncryptionKey("pwd");
    const result = decrypt(eazr, keyB);
    console.log(result);

/*    console.log("pwd", password);
    const derivedKey: string = pbkdf2.pbkdf2Sync(password, 'salt', 10000, 32, 'sha512').toString()
    console.log("key", derivedKey);
    const testMessage = "CECI EST UN MESSAGE DE TEST";
    const encoded: string = encrypt(testMessage, derivedKey);
    console.log("encoded msg", encoded);
    const decoded: string = decrypt(encoded, derivedKey);
    console.log("decoded msg", decoded);



    const tast = CryptoJS.AES.encrypt(testMessage, derivedKey).toString();
    console.log("tast = ", tast)


    const otherDerived = pbkdf2.pbkdf2Sync(password, 'salt', 10000, 32, 'sha512').toString()
    console.log(CryptoJS.AES.decrypt(tast, otherDerived).toString(CryptoJS.enc.Utf8))

    return derivedKey*/
}

taast()

export default class Api {

    static token: string | null = localStorage.getItem("token");
    static encryptionKey: string;

    static axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_API_URL || "http://localhost:8090",
        headers: {'Content-Type' : 'application/json', "Authorization": "Bearer " + Api.token}
    });

    static getSpotifyUrl() {
        return this.axiosInstance.get("/spotify/url")
    }

    static register(email: string, pwd: string) {
        return this.axiosInstance.post("/register", {
            email,
            password: pwd
        });
    }

    static async login(email: string, pwd: string) {
        try {
            const response = await this.axiosInstance.post("/login", {
                email,
                password: pwd
            });
            this.token = response.data.token;
            this.axiosInstance.defaults.headers.Authorization = "Bearer " + this.token;
            localStorage.setItem("token", String(this.token));

            this.encryptionKey = generateEncryptionKey(pwd)
        } catch (e) {
            console.log(e);
        }
    }

    static async getApiKeys() {
        return this.axiosInstance.get("/connectors");
    }
}
