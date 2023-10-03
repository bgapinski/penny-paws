import React, { useState, useEffect } from 'react';
import './App.css';
import moment from 'moment';
import { CSVLink } from 'react-csv';

class Event {
    time: number;
    type: EventTypeKey;

    constructor(time: number, type: EventTypeKey) {
        this.time = time;
        this.type = type;
    }

    print(): string {
        return `${formatTime(this.time)} - ${this.type}`
    }
}

const formatTime = (milliseconds: number) => {
    return moment.utc(milliseconds).format('HH:mm:ss.SSS');
};

enum EventType {
    Scratch,
    Sniff,
    TailWag,
    Door,
    Down,
    GetsUp,
    WeightShift,
    Sit,
    Other,
}

type EventTypeKey = keyof typeof EventType

function App() {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [running, setRunning] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        const updateStopwatch = () => {
            const currentTime = Date.now();
            const newElapsedTime = currentTime - (startTime || 0);
            setElapsedTime(newElapsedTime);
        };

        let interval: NodeJS.Timeout;

        if (running) {
            interval = setInterval(updateStopwatch, 10);
        }

        return () => clearInterval(interval);
    }, [running, startTime]);

    const startStop = () => {
        if (!running) {
            setRunning(true);
            setStartTime(Date.now() - elapsedTime);
        } else {
            setRunning(false);
        }
    };

    const logEvent = (eventType: EventTypeKey) => {
        setEvents([...events, new Event(elapsedTime, eventType)]);
    };

    const reset = () => {
        setStartTime(null);
        setRunning(false);
        setElapsedTime(0);
        setEvents([]);
    };

    return (
        <div className="App">
            <div>
                <CSVLink className="csv" data={events} filename={"events.csv"}>
                    Download CSV
                </CSVLink>
                <button className="stopwatch-reset" onClick={reset}>Reset</button>
            </div>
            <div className="stopwatch">{formatTime(elapsedTime)}</div>
            <div><button className={running ? "stopwatch-stop" : "stopwatch-start"} onClick={startStop}>{running ? 'Stop' : 'Start'}</button></div>
            <div className="actions">
                {Object.keys(EventType).filter(key => isNaN(Number(key))).map(eventType => (
                    <button className="action-button" onClick={() => logEvent(eventType as EventTypeKey)} key={eventType}>
                        {eventType}
                    </button>
                ))}
            </div>
            <ul>
                {events.map((event, index) => (
                    <li key={index}>{event.print()}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
