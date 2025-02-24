"use client";
import Menu from "@/layout/menu";
import styles from "./page.module.css";
import CostosPage from "@/components/pages/costos";
import {useAuthenticated} from "@/utils/authenticated";

export default function CososPage() {
    useAuthenticated();
    return (
        <>
            <Menu />
            <main className={styles.page}>
                <CostosPage />
            </main>
        </>
    );
}
