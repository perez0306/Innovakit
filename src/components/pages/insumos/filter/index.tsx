import DialogComponent from "@/components/shared/dialog";
import { FC, useEffect, useState } from "react";
import styles from "./index.module.css";
import supabase from "@/utils/supabase";
import { fetchDataInsumo, fetchDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";
import Select from "react-select";
import { SelectI } from "@/typings/store";
import { formatMiles, formatSuplies, getCostFormat, getCostValue } from "@/utils/formated";

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
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className={styles.searchInput}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              const { data, error } = await supabase
                .from('insumos')
                .select()
                .ilike('descripcion', `%${e.currentTarget.value}%`);
              if (error) {
                setSuplies([]);
                return;
              }
              const sipliesData = await Promise.all(
                data.map(async (item) => {
                  const { data: dataVendor, error: errorVendor } = await supabase
                    .from("proveedores")
                    .select()
                    .eq("id", item.proveedor);
                  const costo = getCostValue(item.costos);
                  return {
                    ...item,
                    proveedor: {
                      value: item.proveedor,
                      label: errorVendor ? "" : dataVendor?.[0].nombre,
                    },
                    costo: formatMiles(costo),
                  };
                })
              );
              const insumoFormat = formatSuplies(sipliesData);
              setSuplies(insumoFormat);
            }
          }}
        />
        <button
          className={styles.searchButton}
          onClick={async (e) => {
            const input = e.currentTarget.previousSibling as HTMLInputElement;
            const { data, error } = await supabase
              .from('insumos')
              .select()
              .ilike('descripcion', `%${input.value}%`);
            if (error) {
              setSuplies([]);
              return;
            }
            const sipliesData = await Promise.all(
              data.map(async (item) => {
                const { data: dataVendor, error: errorVendor } = await supabase
                  .from("proveedores")
                  .select()
                  .eq("id", item.proveedor);
                const costo = getCostValue(item.costos);
                return {
                  ...item,
                  proveedor: {
                    value: item.proveedor,
                    label: errorVendor ? "" : dataVendor?.[0].nombre,
                  },
                  costo: formatMiles(costo),
                };
              })
            );
            const insumoFormat = formatSuplies(sipliesData);
            setSuplies(insumoFormat);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.searchIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>
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
