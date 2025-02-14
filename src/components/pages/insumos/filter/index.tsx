import DialogComponent from "@/components/shared/dialog";
import { useState } from "react";
import styles from "./index.module.css";
import supabase from "@/utils/supabase";
import { fetchDataInsumo, fetchDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";
import Select from "react-select";
import { formatSelectInsumo } from "@/utils/formated";

const FilterTable = () => {
  const [openModal, setOpenModal] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [classification, setClassification] = useState("");
  const [cost, setCost] = useState("");
  const [optionVendor, setOptionVendor] = useState({
    label: "Seleccione",
    value: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setVendor, vendor, setSuplies } = useAppContext();

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
          id: id,
          descripcion: name,
          clasificacion: classification,
          proveedor: optionVendor.value,
          costo: cost,
        },
      ])
      .select();

    if (error) {
      setIsSubmitting(false);
      return;
    }
    fetchDataVendor(setVendor);
    fetchDataInsumo(setSuplies);
    setIsSubmitting(false);
    setName("");
    closeModal();
  };

  const vendorOptions = formatSelectInsumo(vendor);

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
            <input
              type="text"
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
