"use client";
import Menu from "@/layout/menu";
import styles from "./page.module.css";
import {useAuthenticated} from "@/utils/authenticated";
import Dashboard from "@/components/pages/dashboard";
export default function DashboardPage() {
    useAuthenticated();

    return (
        <>
            <Menu />
            <main className={styles.page}>
                <Dashboard />
            </main>
        </>
    );
}
