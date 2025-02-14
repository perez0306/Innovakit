import TableComponent from "@/components/shared/table";
import styles from "./index.module.css";
import { header } from "./utils";
import { useEffect, useState } from "react";
import DialogComponent from "@/components/shared/dialog";
import FilterTable from "./filter";
import { fetchDataInsumo, fetchDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";

const Insumos = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [vendorState, setVendorState] = useState<{ id: string; label: string }>(
    { id: "", label: "" }
  );
  const { setVendor, suplies, setSuplies } = useAppContext();

  const deleteAction = async (id: string, label: string) => {
    setVendorState({ label, id });
    setOpenModal(true);
  };

  const editAction = (id: string, label: string) => {
    setVendorState({ label, id });
    setEditModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditModal(false);
  };

  const refeshData = async () => {
    fetchDataVendor(setVendor);
    fetchDataInsumo(setSuplies);
  };

  useEffect(() => {
    refeshData();
  }, []);

  console.log(suplies);

  return (
    <div className={styles.content}>
      <h1>Insumos</h1>
      <FilterTable />
      <TableComponent
        indexKey={3}
        header={header}
        rows={suplies}
        deleteAction={deleteAction}
        editAction={editAction}
      />
      {openModal && (
        <DialogComponent
          title="Borrar Insumo"
          open={openModal}
          handleClose={closeModal}
        >
          <p className={styles.text}>
            Esta seguro de eliminar a {vendorState.label}
          </p>
          <div className={styles.buttonContainer}>
            <button
              onClick={closeModal}
              className={`${styles.button} ${styles.close}`}
            >
              Cerrar
            </button>
            <button
              onClick={() => {}}
              className={`${styles.button} ${styles.delete}`}
            >
              Borrar
            </button>
          </div>
        </DialogComponent>
      )}
    </div>
  );
};

export default Insumos;
