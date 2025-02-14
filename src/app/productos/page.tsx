"use client";
import Menu from "@/layout/menu";
import styles from "./page.module.css";
import {useAuthenticated} from "@/utils/authenticated";

export default function Home() {
    useAuthenticated();

    return (
        <>
            <Menu />
            <main className={styles.page}>
                home
            </main>
        </>
    );
}
