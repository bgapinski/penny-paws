import React, {useEffect} from 'react';
import './App.css';
import moment from 'moment';
import {CSVLink} from 'react-csv';
import {useLocalStorage} from './useLocalStorage';

interface Event {
    time: number;
    type: EventTypeKey | 'END_SET';
}

const formatTime = (milliseconds: number) => {
    return moment.utc(milliseconds).format('H:mm:ss.SS');
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
    const [startTime, setStartTime] = useLocalStorage<number|null>("startTime", null)
    const [running, setRunning] = useLocalStorage<boolean>("running", false);
    const [elapsedTime, setElapsedTime] = useLocalStorage<number>("elapsedTime", 0);
    const [events, setEvents] = useLocalStorage<Event[]>("events", [])

    useEffect(() => {
        // Save events to local storage whenever the events state changes
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        // Save events to local storage whenever the events state changes
        localStorage.setItem('startTime', JSON.stringify(startTime));
    }, [startTime]);

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
    }, [running, startTime, setElapsedTime]);

    const startStop = () => {
        if (!running) {
            setRunning(true);
            setStartTime(Date.now() - elapsedTime);
        } else {
            setRunning(false);
            setElapsedTime(0)
            logEvent('END_SET');
        }
    };

    const logEvent = (eventType: EventTypeKey | 'END_SET') => {
        setEvents([{ "time": elapsedTime, "type": eventType }, ...events]);
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
            <div>
                <button className={running ? "stopwatch-stop" : "stopwatch-start"} onClick={startStop}>{running ? 'Stop' : 'Start'}</button>
            </div>
            <div className="actions">
                {Object.keys(EventType).filter(key => isNaN(Number(key))).map(eventType => (
                    <button className="action-button" onClick={() => logEvent(eventType as EventTypeKey)} key={eventType}>
                        {eventType}
                    </button>
                ))}
            </div>
            <ul>
                {events.map((event, index) => (
                    event.type === 'END_SET' ? <hr className='horizontal' /> : <li key={index}>{`${formatTime(event.time)} - ${event.type}`}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
