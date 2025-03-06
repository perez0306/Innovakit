import { useAppContext } from "@/context/store";
import styles from "./index.module.css";
import { useRouter } from "next/navigation";
import { formatProduct } from "@/utils/formated";
import supabase from "@/utils/supabase";
import { getProduct } from "@/context/refesh";

const FilterComponent = () => {
    const router = useRouter();
    const { setProduct } = useAppContext();

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
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className={styles.searchInput}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                const { data, error } = await supabase
                                    .from('productos')
                                    .select()
                                    .eq('categoria', categorySelected)
                                    .ilike('nombre', `%${e.currentTarget.value}%`);
                                const productFormat = await getProduct(error, data || []);
                                setProduct(productFormat);
                            }
                        }}
                    />
                    <button
                        className={styles.searchButton}
                        onClick={async (e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                            const { data } = await supabase
                                .from('productos')
                                .select()
                                .eq('categoria', categorySelected)
                                .ilike('nombre', `%${input.value}%`);
                            setProduct(formatProduct(data || []));
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.searchIcon}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </button>
                </div>
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