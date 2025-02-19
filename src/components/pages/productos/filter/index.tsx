import styles from "./index.module.css";
import { useRouter } from "next/navigation";
const FilterComponent = () => {
    const router = useRouter();

    const onCreate = () => {
        router.push("/productos/0");
    }

    return (
        <div className={styles.filterContainer}>
            <button className={styles.button} onClick={onCreate}>
                Crear Insumo
            </button>
        </div>
    )
}

export default FilterComponent;