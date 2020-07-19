"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = __importDefault(require("ws"));
const environment_config_1 = require("./environment/environment.config");
const http = __importStar(require("http"));
const path = __importStar(require("path"));
// @ts-ignore
const uuid4_1 = __importDefault(require("uuid4"));
const app = express_1.default();
const messages = [];
const CLIENTS = [];
let activeConnections = 0;
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.get('/dash', (req, res) => {
    const messageString = messages.map(item => `${item.id} : ${item.message}`).join('\n');
    res.render('dashboard.ejs', { value: activeConnections, messages: messageString });
});
app.get('/getConnections', (req, res) => {
    return { activeConnections, messages };
});
app.get('/message', (req, res) => {
    res.render('sendMessage');
});
// start the Express server
const server = http.createServer(app);
server.listen(environment_config_1.defaultConfig.server.port);
const wss = new ws_1.default.Server({ server });
const connections = [];
wss.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    ws.id = uuid4_1.default();
    CLIENTS.push(ws);
    activeConnections++;
    // tslint:disable-next-line:no-console
    console.log('New Connection received');
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        if (message !== 'getConnections') {
            // tslint:disable-next-line:no-console
            console.log('received: %s', message);
            messages.push({ message, id: ws.id });
            // tslint:disable-next-line:no-console
            console.log('Messages: %s', JSON.stringify(messages));
            sendAll(message);
        }
        else {
            // ws.send({activeConnections, messages});
        }
    }));
    ws.on('close', () => __awaiter(void 0, void 0, void 0, function* () {
        // tslint:disable-next-line:no-console
        console.log('connection closed');
        activeConnections--;
    }));
}));
function sendAll(message) {
    for (const client of CLIENTS) {
        client.send("Message: " + message);
    }
}
//# sourceMappingURL=index.js.map