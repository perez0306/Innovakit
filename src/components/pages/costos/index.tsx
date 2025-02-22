import supabase from "@/utils/supabase";
import styles from "./index.module.css";
import DialogComponent from "@/components/shared/dialog";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { desformatearValorCosto, formatearValorCosto } from "./utils";
import ReturnComponent from "@/components/shared/return";

const CostosPage = () => {
  const [costos, setCostos] = useState<Array<{ id?: string, nombre: string, valor: number }>>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedCosto, setSelectedCosto] = useState<{ id?: string, nombre: string, index: number }>();
  const [loading, setLoading] = useState<boolean>(false);

  const obtenerCostos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('costos')
      .select('*');

    if (error) {
      alert('Error al cargar los costos');
    } else {
      const costosFormateados = data?.map(costo => ({
        ...costo,
        valor: desformatearValorCosto(Number(costo.valor))
      }));
      setCostos(costosFormateados || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    obtenerCostos();
  }, []);

  const agregarCosto = () => {
    setCostos([...costos, {
      nombre: '',
      valor: 0
    }]);
  };

  const actualizarCosto = (index: number, campo: 'nombre' | 'valor', valor: string | number) => {
    const nuevosCostos = [...costos];
    nuevosCostos[index] = {
      ...nuevosCostos[index],
      [campo]: valor
    };
    setCostos(nuevosCostos);
  };

  const confirmarEliminar = (id: string | undefined, nombre: string, index: number) => {
    setSelectedCosto({ id, nombre, index });
    setOpenModal(true);
  };

  const eliminarCosto = async () => {
    if (!selectedCosto) return;

    setLoading(true);
    
    if (selectedCosto.id) {
      const { error } = await supabase
        .from('costos')
        .delete()
        .eq('id', selectedCosto.id);

      if (error) {
        alert('Error al eliminar el costo');
        setLoading(false);
        return;
      }
    }

    setCostos(costos.filter((_, index) => index !== selectedCosto.index));
    setOpenModal(false);
    setLoading(false);
  };

  const guardarCostos = async () => {
    const camposVacios = costos.some(costo => !costo.nombre.trim() || costo.valor === null || costo.valor === undefined || costo.valor.toString().trim() === '');

    if (camposVacios) {
      alert('Por favor complete todos los campos antes de guardar');
      return;
    }

    setLoading(true);
    
    const nuevosRegistros = costos.filter(c => !c.id).map(c => ({
        ...c,
        valor: formatearValorCosto(Number(c.valor))
    }));
    const registrosExistentes = costos.filter(c => c.id).map(c => ({
        ...c, 
        valor: formatearValorCosto(Number(c.valor))
    }));

    try {
      if (nuevosRegistros.length > 0) {
        const { error: errorInsercion } = await supabase
          .from('costos')
          .insert(nuevosRegistros);

        if (errorInsercion) throw new Error('Error al crear nuevos costos');
      }

      for (const costo of registrosExistentes) {
        const { error: errorActualizacion } = await supabase
          .from('costos')
          .update({ nombre: costo.nombre, valor: costo.valor })
          .eq('id', costo.id);

        if (errorActualizacion) throw new Error('Error al actualizar costos existentes');
      }

      alert('Costos guardados exitosamente');
      
      obtenerCostos();

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar los costos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={styles.content}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ReturnComponent />
      <motion.h1
        className={styles.title}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        Costos
      </motion.h1>
      <AnimatePresence>
        <motion.ul className={styles.containerItems}>
          {costos.map((costo, index) => (
            <motion.li
              key={index}
              className={styles.costoItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <input
                type="text"
                value={costo.nombre}
                onChange={(e) => actualizarCosto(index, 'nombre', e.target.value)}
                placeholder="Nombre del costo"
                className={styles.input}
                required
              />
              <input
                type="number"
                value={costo.valor}
                onChange={(e) => {
                  const valor = e.target.value === '' ? '' : parseFloat(e.target.value);
                  if (valor === '' || (!isNaN(valor) && valor >= 0 && valor <= 100)) {
                    actualizarCosto(index, 'valor', valor);
                  }
                }}
                min="0"
                max="100"
                step="0.01"
                placeholder="Porcentaje (0-100)"
                className={styles.input}
                required
              />
              <motion.button
                className={`${styles.button} ${styles.delete}`}
                onClick={() => confirmarEliminar(costo?.id, costo?.nombre, index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Eliminar
              </motion.button>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>

      <motion.div
        className={styles.buttonContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className={`${styles.button} ${styles.add}`}
          onClick={agregarCosto}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Agregar Costo
        </motion.button>
        <motion.button
          className={`${styles.button} ${styles.save}`}
          onClick={guardarCostos}
          disabled={loading || costos.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Guardando...' : 'Guardar Costos'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {openModal && (
          <DialogComponent
            open={openModal}
            handleClose={() => setOpenModal(false)}
            title="Confirmar eliminación"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {`¿Estás seguro que deseas eliminar el costo "${selectedCosto?.nombre ?? ''}"?`}
            </motion.p>
            <motion.div
              className={styles.buttonContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.button
                className={`${styles.button} ${styles.close}`}
                onClick={() => setOpenModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                className={`${styles.button} ${styles.delete}`}
                onClick={eliminarCosto}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </motion.button>
            </motion.div>
          </DialogComponent>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CostosPage;
