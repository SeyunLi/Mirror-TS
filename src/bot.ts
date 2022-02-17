import {Client} from 'discord.js';
import { CustomLogger } from './CustomLogger';
import { TLogLevelName, Logger } from 'tslog';

export class Bot {

    public logger: CustomLogger;

    constructor(
        private token: string,
        private client: Client,
        private mode: string
    ){
        //initialize logger
        let now = new Date();
        let logfileName = `./logs/${now.getMonth()+1}-${now.getDate()}-${now.getFullYear()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
        let logLevel: TLogLevelName = this.mode == 'debug' ? "debug" : "info";
        this.logger = new CustomLogger(logfileName, logLevel);
    }

    public async start(): Promise<void> {

        await this.logger.initialize();
        this.logger.debug("test");

    }

}