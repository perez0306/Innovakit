"use client";
import Menu from "@/layout/menu";
import styles from "./page.module.css";
import ProveedoresPage from "@/components/pages/proveedores";
import {useAuthenticated} from "@/utils/authenticated";

export default function Proveedores() {
    useAuthenticated();
    return (
        <>
            <Menu />
            <main className={styles.page}>
                <ProveedoresPage />
            </main>
        </>
    );
}
