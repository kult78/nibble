
export enum Level {
    Info,
    Warning,
    Error
};

type LogEventHandler = (level: Level, text: string, channel: string) => void;

let logEventHandler: LogEventHandler = () => {};
let enableLogConsole: boolean = true;

export function enableLogToConsole(enable: boolean) {
    enableLogConsole = enable;
}

// function to call when any type of logging is called (Level enum, text, channel)
export function setLogEventHandler(handler: LogEventHandler) {
    if(handler == null) {
        logEventHandler = () => {};
    } else {
        logEventHandler = handler;
    }
} 

// log info (text, channel)
export function info(text: string, channel: string = "") {
    if(enableLogConsole) {
        let s = text;
        if(channel != "")
            s = `[${channel}] ${s}`;
        console.info(s);
    }
    logEventHandler(Level.Info, text, channel);
}

// log warning (text, channel)
export function warning(text: string, channel: string = "") {
    if(enableLogConsole) {
        let s = text; 
        if(channel != "")
            s = `[${channel}] ${s}`;
        console.warn(s);
    }
    logEventHandler(Level.Warning, text, channel);
} 

// log error (text, channel)
export function error(text: string, channel: string = "") {
    if(enableLogConsole) {
        let s = text;
        if(channel != "")
            s = `[${channel}] ${s}`;
        console.error(s);
    }
    logEventHandler(Level.Error, text, channel);
}

