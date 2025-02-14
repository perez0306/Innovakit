"use client";
import Menu from "@/layout/menu";
import styles from "./page.module.css";
import {useAuthenticated} from "@/utils/authenticated";
import Insumos from "@/components/pages/insumos";

export default function InsumosPAge() {
    useAuthenticated();

    return (
        <>
            <Menu />
            <main className={styles.page}>
                <Insumos />
            </main>
        </>
    );
}
