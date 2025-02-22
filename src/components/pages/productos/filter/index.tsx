import { useAppContext } from "@/context/store";
import styles from "./index.module.css";
import { useRouter } from "next/navigation";
const FilterComponent = () => {
    const router = useRouter();

    const onCreate = () => {
        router.push("/productos/0");
    }

    const { categorySelected, setCategorySelected } = useAppContext();

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategorySelected(e.target.value);
    }

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterContainer}>
                <select 
                    name="category" 
                    id="category" 
                    value={categorySelected} 
                    onChange={handleCategoryChange}
                    className={styles.select}
                >
                    <option value="1">General</option>
                    <option value="2">Marquesina Cafe</option>
                    <option value="3">Marquesina Cacao</option>
                </select>
            </div>
            <button className={styles.button} onClick={onCreate}>
                Crear Producto
            </button>
        </div>
    )
}

export default FilterComponent;