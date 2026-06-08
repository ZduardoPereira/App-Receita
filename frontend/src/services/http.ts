import axios from "axios";

export const http = axios.create({
    baseURL: 'http://10.171.217.35:3000',
    timeout: 10000
});