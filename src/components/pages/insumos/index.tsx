import TableComponent from "@/components/shared/table";
import styles from "./index.module.css";
import { header } from "./utils";
import { useCallback, useEffect, useState } from "react";
import DialogComponent from "@/components/shared/dialog";
import FilterTable from "./filter";
import { fetchDataInsumo, fetchDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";
import supabase from "@/utils/supabase";
import Select from "react-select";
import { formatSelectInsumo, getCostFormat } from "@/utils/formated";

const Insumos = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [editModal, setEditModal] = useState<boolean>(false);
  const [suplierState, setSuplierState] = useState<{
    id: string;
    name: string;
    classification: string;
    optionVendor: { label: string; value: string };
    cost: number;
  }>({
    id: "",
    name: "",
    classification: "",
    optionVendor: { label: "", value: "" },
    cost: 0,
  });
  const { setVendor, suplies, setSuplies, vendor } = useAppContext();

  const deleteAction = async (id: string, label: string, index: number) => {
    setSuplierState({
      id,
      name: suplies[index].data[1].label,
      classification: suplies[index].data[2].label,
      optionVendor: {
        label: suplies[index].data[3].label,
        value: suplies[index].data[3].key,
      },
      cost: Number(suplies[index].data[4].label.replace(/,/g, '')),
    });
    setOpenModal(true);
  };

  const editAction = (id: string, label: string, index: number) => {
    setSuplierState({
      id,
      name: suplies[index].data[1].label,
      classification: suplies[index].data[2].label,
      optionVendor: {
        label: suplies[index].data[3].label,
        value: suplies[index].data[3].key,
      },
      cost: Number(suplies[index].data[4].label.replace(/,/g, '')),
    });
    setEditModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditModal(false);
  };

  const deleteSuplies = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("insumos")
      .delete()
      .eq("id", suplierState.id)
      .eq("proveedor", suplierState.optionVendor.value);
    if (error) {
      alert("Error al borrar el insumo");
    }
    setLoading(false);
    refeshData();
    closeModal();
  };

  const actionSend = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    supabase
      .from("insumos")
      .update({
        descripcion: suplierState.name,
        clasificacion: suplierState.classification,
        proveedor: suplierState.optionVendor.value,
        costos: getCostFormat(Number(suplierState.cost)),
      })
      .eq("id", suplierState.id)
      .then(({ error }) => {
        if (error) {
          if (
            error.message.includes(
              "duplicate key value violates unique constraint"
            )
          ) {
            setError("¡El Insumo ya existe!");
          } else {
            setError("¡Error al crear el Insumo!");
          }
          setLoading(false);
          return;
        }
        refeshData();
        setLoading(false);
        setEditModal(false);
      });
  };

  const refeshData = useCallback(async () => {
    fetchDataVendor(setVendor);
    fetchDataInsumo(setSuplies);
  }, [setVendor, setSuplies]);

  useEffect(() => {
    refeshData();
  }, [refeshData]);

  useEffect(() => {
    setError("");
  }, [editModal]);

  const vendorOptions = formatSelectInsumo(vendor);

  return (
    <div className={styles.content}>
      <h1>Insumos</h1>
      <FilterTable vendorOptions={vendorOptions} />
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
            Esta seguro de eliminar a {suplierState.id}-
            {suplierState.optionVendor.label}?
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
              onClick={deleteSuplies}
              className={`${styles.button} ${styles.delete}`}
              disabled={loading}
            >
              {loading ? "Borrando insumo" : "Borrar"}
            </button>
          </div>
        </DialogComponent>
      )}
      {editModal && (
        <DialogComponent
          title="Actualizar Insumo"
          open={editModal}
          handleClose={closeModal}
        >
          <form className={styles.form} onSubmit={actionSend}>
            {error && <p className={styles.error}>{error}</p>}
            <input
              type="number"
              placeholder="ID"
              value={suplierState.id}
              onChange={(e) =>
                setSuplierState((prev) => {
                  return { ...prev, id: e.target.value };
                })
              }
              disabled
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Descripción"
              value={suplierState.name}
              onChange={(e) =>
                setSuplierState((prev) => {
                  return { ...prev, name: e.target.value };
                })
              }
              className={styles.input}
              required
            />
            <select
              value={suplierState.classification}
              onChange={(e) =>
                setSuplierState((prev) => {
                  return { ...prev, classification: e.target.value };
                })
              }
              className={styles.select}
              required
            >
              <option value="">Seleccione una clasificación</option>
              <option value="distribucion">Distribucion</option>
              <option value="propio">Propio</option>
            </select>
            <Select
              options={vendorOptions}
              value={suplierState.optionVendor}
              onChange={(e) =>
                e
                  ? setSuplierState((prev) => {
                      return { ...prev, optionVendor: e };
                    })
                  : { label: "Seleccione", value: "" }
              }
              placeholder="Seleccione un proveedor"
              isSearchable
              isDisabled
              required
            />
            <input
              type="number"
              placeholder="Costo"
              value={suplierState.cost}
              onChange={(e) =>
                setSuplierState((prev) => {
                  return { ...prev, cost: Number(e.target.value) };
                })
              }
              className={styles.input}
              required
            />
            <button className={styles.buttonClose} onClick={closeModal}>
              Cerrar
            </button>
            <button type="submit" className={styles.button}>
              Editar
            </button>
          </form>
        </DialogComponent>
      )}
    </div>
  );
};

export default Insumos;
