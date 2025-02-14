import { useCloseSession } from "@/utils/authenticated";
import Sidebar from "../sidebar";
import styles from "./index.module.css";

const Menu = () => {
    const { closeSession } = useCloseSession();

    return <div className={styles.menu}>
        <div className={styles.header}>
            <Sidebar />
            <span className={styles.username}>¡Bienvenido!</span>
        </div>
        <button className={styles.logoutButton} onClick={closeSession}>
            Cerrar sesión
        </button>
    </div>
}

export default Menu;