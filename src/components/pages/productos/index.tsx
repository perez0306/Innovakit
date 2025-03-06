import TableComponent from "@/components/shared/table";
import { useEffect, useState } from "react";
import styles from "./index.module.css";
import { header } from "./utils";
import { useAppContext } from "@/context/store";
import { fetchDataProduct } from "@/context/refesh";
import FilterComponent from "./filter";
import DialogComponent from "@/components/shared/dialog";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";

const Productos = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [productState, setProductState] = useState<{ id: string, index: number }>();
    const { product, setProduct, categorySelected } = useAppContext();
    const router = useRouter();
    const deleteAction = (id: string, name: string, index: number) => {
        setOpenModal(true);
        setProductState({ id, index });
    }

    console.log({product});

    const editAction = (id: string) => {
        router.push(`/productos/${id}`);
    }

    const closeModal = () => {
        setOpenModal(false);
    };

    const deleteProduct = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', productState?.id)
            .eq('categoria', categorySelected);

        if (error) {
            console.log(error);
        }

        fetchDataProduct(setProduct, categorySelected);
        setOpenModal(false);
        setLoading(false);
    }

    useEffect(() => {
        fetchDataProduct(setProduct, categorySelected);
          // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categorySelected]);

    return (
        <div className={styles.content}>
            <h1>Productos</h1>
            <FilterComponent />
            <TableComponent
                indexKey={1}
                header={header}
                rows={product}
                deleteAction={deleteAction}
                editAction={editAction}
            />
            {openModal && (
                <DialogComponent
                    title="Borrar Producto"
                    open={openModal}
                    handleClose={closeModal}
                >
                    <p className={styles.text}>
                        Esta seguro de eliminar a {productState?.id}-
                        {product[productState?.index ?? 0].data[1].label}?
                    </p>
                    <div className={styles.buttonContainer}>
                        <button
                            onClick={closeModal}
                            className={`${styles.button} ${styles.close}`}
                            disabled={loading}
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={deleteProduct}
                            className={`${styles.button} ${styles.delete}`}
                            disabled={loading}
                        >
                            {loading ? "Borrando producto" : "Borrar"}
                        </button>
                    </div>
                </DialogComponent>
            )}
        </div>
    )
}

export default Productos;