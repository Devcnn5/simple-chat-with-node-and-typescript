import express from "express";
import WebSocket from "ws";
import { defaultConfig } from './environment/environment.config';
import * as http from 'http';
import * as path from 'path';
// @ts-ignore
import uuid from 'uuid4';
const app = express();
const messages: { message: any; id: any; }[] = [];
const CLIENTS: string | any[]=[];
let activeConnections=0;
app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "ejs" );
// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );


// Routes
// TODO: Setup the routes in a different folder, but since there are just two...similarly controllers in a different file.
app.get('/dash', (req,res) => {
  const messageString = messages.map(item => `${item.id} : ${item.message}`).join('\n');
    res.render('dashboard.ejs',{ value: activeConnections, messages: messageString});
});

app.get('/message', (req, res)=>{
    res.render('sendMessage');
});


// start the Express server
const server = http.createServer(app);
server.listen(defaultConfig.server.port);
const wss = new WebSocket.Server({ server });
const connections = [];
wss.on('connection', async (ws: any) => {
    ws.id = uuid();
    CLIENTS.push(ws);
    activeConnections++;
    // tslint:disable-next-line:no-console
    console.log('New Connection received');
    ws.on('message', async (message: any) => {
        // tslint:disable-next-line:no-console
        console.log('received: %s', message);
        messages.push({ message, id: ws.id });
        // tslint:disable-next-line:no-console
        console.log('Messages: %s', JSON.stringify(messages));
        sendAll(message);
    });
    ws.on('close', async () => {
        // tslint:disable-next-line:no-console
        console.log('connection closed');
        activeConnections--;
    });
});
function sendAll(message:any){
    for (const client of CLIENTS) {
        client.send("Message: " + message);
    }
}
