"use client";
import Menu from "@/layout/menu";
import styles from "./page.module.css";
import { useAuthenticated } from "@/utils/authenticated";
import Productos from "@/components/pages/productos";

export default function Home() {
    useAuthenticated();

    return (
        <>
            <Menu />
            <main className={styles.page}>
                <Productos />
            </main>
        </>
    );
}
