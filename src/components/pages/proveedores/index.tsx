import styles from "./index.module.css";
import TableComponent from "@/components/shared/table";
import FilterTable from "./filter";
import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/store";
import { header } from "./utils";
import { fetchDataVendor } from "@/context/refesh";
import DialogComponent from "@/components/shared/dialog";
import ReturnComponent from "@/components/shared/return";
const ProveedoresPage = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [company, setCompany] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetch, setFetch] = useState<{ text: string; loading: boolean }>({
    text: "",
    loading: false,
  });

  const [vendorState, setVendorState] = useState<{ id: string; label: string }>(
    { id: "", label: "" }
  );
  const { setVendor, vendor } = useAppContext();

  const deleteAction = async (id: string, label: string) => {
    setVendorState({ label, id });
    setOpenModal(true);
  };

  const deleteVendor = async () => {
    setFetch({ text: "Borrando proveedor", loading: true });
    const { error } = await supabase
      .from("proveedores")
      .delete()
      .eq("id", vendorState.id);
    if (error) {
      alert("Error al borrar el proveedor");
      return;
    } else {
      refeshData();
      setOpenModal(false);
    }
  };

  const editAction = (id: string, label: string) => {
    setCompany(label);
    setVendorState({ label, id });
    setEditModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditModal(false);
  };

  const refeshData = async () => {
    fetchDataVendor(setVendor);
  };

  const actionSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("proveedores")
      .update({ nombre: company })
      .eq("id", vendorState.id)
      .select();
    if (error) {
      alert("Error al actualizar el proveedor");
      return;
    }
    refeshData();
    setLoading(false);
    setEditModal(false);
  };

  useEffect(() => {
    refeshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.content}>
      <ReturnComponent />
      <h1>Proveedores</h1>
      <FilterTable />
      <TableComponent
        indexKey={0}
        header={header}
        rows={vendor}
        deleteAction={deleteAction}
        editAction={editAction}
      />
      {openModal && (
        <DialogComponent
          title="Borrar Proveedor"
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
              disabled={fetch.loading}
            >
              Cerrar
            </button>
            <button
              onClick={deleteVendor}
              className={`${styles.button} ${styles.delete}`}
              disabled={fetch.loading}
            >
              {fetch.loading ? fetch.text : "Borrar"}
            </button>
          </div>
        </DialogComponent>
      )}
      {editModal && (
        <DialogComponent
          title="Crear Proveedor"
          open={editModal}
          handleClose={closeModal}
        >
          <form className={styles.form} onSubmit={actionSend}>
            <input
              type="text"
              placeholder="Nombre Proveedor"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </form>
        </DialogComponent>
      )}
    </div>
  );
};
export default ProveedoresPage;
