"use client";
import { useState } from "react";
import styles from "./index.module.css";
import DialogComponent from "@/components/shared/dialog";
import supabase from "@/utils/supabase";
import { fetchDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";

const FilterTable = () => {
  const [name, setName] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { setVendor } = useAppContext();

  const onCreate = () => {
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  const actionSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from("proveedores")
      .insert([{ nombre: name }])
      .select();

    if (error) {
      setIsSubmitting(false);
      return;
    }
    fetchDataVendor(setVendor);
    setIsSubmitting(false);
    setName("");
    closeModal();
  };

  return (
    <div className={styles.filterContainer}>
      <button className={styles.createButton} onClick={onCreate}>
        Crear proveedor
      </button>
      {openModal && (
        <DialogComponent
          title="Crear Proveedor"
          open={openModal}
          handleClose={closeModal}
        >
          <form className={styles.form} onSubmit={actionSend}>
            <input
              type="text"
              placeholder="Nombre Proveedor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </form>
        </DialogComponent>
      )}
    </div>
  );
};

export default FilterTable;
