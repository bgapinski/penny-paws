"use client";

import styles from "@/app/page.module.css";

import dynamic from "next/dynamic";

const Timer = dynamic(() => import("@/app/timer").then((mod) => mod.Timer), {
  ssr: false,
});

export default function Home() {
  return (
    <main className={styles.main}>
      <Timer />
    </main>
  );
}
