import { useLocalStorage } from "@/storage/useLocalStorage";
import { useEffect } from "react";
import moment from "moment";

import styles from "@/app/page.module.css";

interface Event {
  time: number;
  type: EventTypeKey | "END_SET";
}

const formatTime = (milliseconds: number) => {
  return moment.utc(milliseconds).format("H:mm:ss.SS");
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

type EventTypeKey = keyof typeof EventType;

export const Timer = function () {
  const [startTime, setStartTime] = useLocalStorage<number | null>(
    "startTime",
    null,
  );
  const [running, setRunning] = useLocalStorage<boolean>("running", false);
  const [elapsedTime, setElapsedTime] = useLocalStorage<number>(
    "elapsedTime",
    0,
  );
  const [events, setEvents] = useLocalStorage<Event[]>("events", []);

  useEffect(() => {
    // Save events to local storage whenever the events state changes
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    // Save events to local storage whenever the events state changes
    localStorage.setItem("startTime", JSON.stringify(startTime));
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
      setElapsedTime(0);
      logEvent("END_SET");
    }
  };

  const logEvent = (eventType: EventTypeKey | "END_SET") => {
    setEvents([{ time: elapsedTime, type: eventType }, ...events]);
  };

  const reset = () => {
    setStartTime(null);
    setRunning(false);
    setElapsedTime(0);
    setEvents([]);
  };

  return (
    <div className={styles.timer}>
      <div>
        <button className={styles.stopwatchReset} onClick={reset}>
          Reset
        </button>
      </div>
      <div className={styles.stopwatch}>{formatTime(elapsedTime)}</div>
      <div>
        <button
          className={running ? styles.stopwatchStop : styles.stopwatchStart}
          onClick={startStop}
        >
          {running ? "Stop" : "Start"}
        </button>
      </div>
      <div className={styles.actions}>
        {Object.keys(EventType)
          .filter((key) => isNaN(Number(key)))
          .map((eventType) => (
            <button
              className={styles.actionButton}
              onClick={() => logEvent(eventType as EventTypeKey)}
              key={eventType}
            >
              {eventType}
            </button>
          ))}
      </div>
      <ul>
        {events.map((event, index) => (
          <>
            {event.type === "END_SET" ? (
              <hr className={styles.horizontal} />
            ) : null}
            <li
              className={styles.event}
              key={index}
            >{`${formatTime(event.time)} - ${event.type}`}</li>
          </>
        ))}
      </ul>
    </div>
  );
};
