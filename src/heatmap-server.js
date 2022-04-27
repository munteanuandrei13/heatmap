import fs from 'fs';
import express from 'express';
import io from 'socket.io';
import http from "http";
import https from "https";
import { checkEnv } from './utils.js';
import Click from "./../models/click.js";

const requirements = [
    'APP_ENV', 'SSL_CERT', 'SSL_KEY', 'HEATMAP_SERVER_PORT', 'AUTH_HOST', 'AUTH_HOST',
];

let env = checkEnv(requirements);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let heatmapServer;

if(env.APP_ENV === 'local') {
    heatmapServer = http.createServer(app);
} else {
    const options = {
        cert: fs.readFileSync(env.SSL_CERT),
        key: fs.readFileSync(env.SSL_KEY)
    };

    heatmapServer = https.createServer(options, app);
}

if(!heatmapServer) {
    console.log('Could not start http server');
    process.exit();
}

heatmapServer.listen(env.HEATMAP_SERVER_PORT);
const sockets = io(heatmapServer,{});

sockets.on('connection', (socket) => {
    if(socket.handshake.headers.origin !== env.AUTH_HOST) {
        console.log(`Origin ${socket.handshake.headers.origin} tried connecting, but the only allowed origin is ${env.AUTH_HOST}.`);
        socket.disconnect();
    }
    Click.sync();
    socket.on('heatmap', data => {
        create(data, socket).then(r => console.log("Click received!")).catch(err => console.error(err));
    });
});

/**
 * @param data
 * @returns {Promise<void>}
 */
async function create(data, socket) {
    const click = Click.build({
        user_id: data.user,
        x_position_percentage: data.x,
        y_position_percentage: data.y,
        route: data.route,
        device: data.device,
        platform: socket.handshake.headers.origin
    });
    await click.save();
}

app.post('/api/get-data-points',async (req, res) => {
    if (req.headers.authorization !== 'Bearer ' + env.HEATMAP_TOKEN) {
        res.status(401).send({error: 'Unauthorized'}, );

        return;
    }

    if (req.body.device === null || req.body.route === null) {
        res.status(400).send({error: 'Params missing'}, );

        return;
    }

    const clicks = await Click.findAll({
        attributes : [['x_position_percentage', 'x'], ['y_position_percentage', 'y']],
        where: {
            route: req.body.route,
            device: req.body.device,
        }
    });

    let items = clicks.reduce(function(results, current) {
        let x = current.getDataValue('x');
        let y = current.getDataValue('y');
        let value = 1;

        let key = x + "-" + y;
        if (!results[key]) {
            results[key] = 0;
        }
        results[key] += value;
        return results;
    }, {});

    let max = 1;

    let outputArr = Object.keys(items).map(function (key) {
       let splitKey = key.split("-");
       let x = parseFloat(splitKey[0]);
       let y = parseFloat(splitKey[1]);
       let value = items[key];

       if (value > max) {
           max = value;
       }

       return {x,y,value};
    });

    res.json({dataSet: outputArr, max: max});
});

console.log(`Started webserver & sockets on port ${env.HEATMAP_SERVER_PORT}`);