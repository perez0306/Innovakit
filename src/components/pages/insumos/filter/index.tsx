import DialogComponent from "@/components/shared/dialog";
import { FC, useEffect, useState } from "react";
import styles from "./index.module.css";
import supabase from "@/utils/supabase";
import { fetchDataInsumo, fetchDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";
import Select from "react-select";
import { SelectI } from "@/typings/store";
import { getCostFormat } from "@/utils/formated";

const FilterTable: FC<{ vendorOptions: SelectI[] }> = ({
  vendorOptions,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [classification, setClassification] = useState("");
  const [cost, setCost] = useState("");
  const [optionVendor, setOptionVendor] = useState({
    label: "Seleccione",
    value: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setVendor, setSuplies } = useAppContext();

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
      .from("insumos")
      .insert([
        {
          id: Number(id),
          descripcion: name,
          clasificacion: classification,
          proveedor: optionVendor.value,
          costos: getCostFormat(Number(cost)),
        },
      ])
      .select();

    if (error) {
      if (
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        setError("¡El Insumo ya existe!");
      } else {
        setError("¡Error al crear el Insumo!");
      }
      setIsSubmitting(false);
      return;
    }
    fetchDataVendor(setVendor);
    fetchDataInsumo(setSuplies);
    setIsSubmitting(false);
    setName("");
    closeModal();
  };

  useEffect(() => {
    setId("");
    setName("");
    setClassification("");
    setCost("");
    setOptionVendor({ label: "Seleccione", value: "" });
    setError("");
  }, [openModal]);

  return (
    <div className={styles.filterContainer}>
      <button className={styles.createButton} onClick={onCreate}>
        Crear Insumo
      </button>
      {openModal && (
        <DialogComponent
          title="Crear Insumo"
          open={openModal}
          handleClose={closeModal}
        >
          <form className={styles.form} onSubmit={actionSend}>
            {error && <p className={styles.error}>{error}</p>}
            <input
              type="number"
              placeholder="ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Descripción"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Seleccione una clasificación</option>
              <option value="distribucion">Distribucion</option>
              <option value="propio">Propio</option>
            </select>
            <Select
              options={vendorOptions}
              value={optionVendor}
              onChange={(e) =>
                setOptionVendor(e ? e : { label: "Seleccione", value: "" })
              }
              placeholder="Seleccione un proveedor"
              isSearchable
              required
            />
            <input
              type="number"
              placeholder="Costo"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className={styles.input}
              required
            />
            <button
              className={styles.buttonClose}
              disabled={isSubmitting}
              onClick={closeModal}
            >
              Cerrar
            </button>
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
