 import { useEffect, useState } from "react";
import { percentageMargenGross, percentageMargenNeto, percentageMargenOperating } from "@/components/pages/productos/detail/utils";
import styles from "./index.module.css";
import supabase from "@/utils/supabase";
import { fetchDataCosts, getDataInsumo, getDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";
import { useRouter } from "next/navigation";
import { ProductI, SupliesI, VendorI } from "@/typings/store";
import { getCostValue, getCategoryProduct } from "@/utils/formated";

export default function Dashboard() {
    const router = useRouter();
    const { setCosts, costs, setCategorySelected } = useAppContext();
    const [reportes, setReportes] = useState<{ id_producto: string, categoria: string }[]>([]);
    const [productos, setProductos] = useState<ProductI[]>([]);
    const [dataInsumo, setDataInsumo] = useState<SupliesI[]>([]);

    const getMargen = (producto: ProductI) => {
        const costoTotal = producto.insumo.reduce((sum, acc) => {
            const [, cantidad] = acc.split('_');
            const [id, proveedor] = acc.split('-');
            const insumo = dataInsumo.find(i => (String(i.id) === id && i.proveedor === proveedor.split('_')[0]));
            const costo = getCostValue(insumo?.costos || {}) || 0;
            return sum + (costo * Number(cantidad));
        }, 0)
        const margenGross = percentageMargenGross(Number(producto.venta), Number(costoTotal))
        const margenOperating = percentageMargenOperating(Number(producto.venta), Number(margenGross.margen), costs)
        const margenNeto = percentageMargenNeto(Number(producto.venta), Number(margenOperating.margen))
        return {margenGross, margenOperating, margenNeto};
    }

    const refectData = () => {
        getDataVendor().then((vendor: VendorI[]) => {
            getDataInsumo().then(async (insumo: SupliesI[]) => {
                const dataInsumoAux: SupliesI[] = await Promise.all(
                    insumo.map(async (item: SupliesI) => {
                        const vendorAux = vendor.find(v => v.id === item.proveedor);
                        return {
                            ...item,
                            proveedor: vendorAux?.nombre || "",
                        };
                    })
                );
                setDataInsumo(dataInsumoAux);
            })
        });
        fetchDataCosts(setCosts);
        getDataReport();
    }

    const getDataReport = async () => {
        const { data: reportes, error } = await supabase
            .from('alertas')
            .select('*');

        if (error || !reportes) {
            setReportes([]);
            return;
        }
        setReportes(reportes);
    }

    const getDataProduct = async (categorySelected: string, id: string) => {
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .eq('categoria', categorySelected)
            .eq('id', id);

        if (error) {
            return null;
        }

        return productos;
    }

    useEffect(() => {
        refectData();
    }, []);

    useEffect(() => {
        reportes.forEach(async (reporte) => {
            const producto = await getDataProduct(reporte.categoria, reporte.id_producto);
            if (producto) {
                setProductos(prev => [...prev, ...producto]);
            }
        });
    }, [reportes]);


    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>Dashboard de Productos</h1>

            <div className={styles.summary}>
                <h2 className={styles.subtitle}>
                    Productos con margen neto menor a 20%
                    <span className={styles.badge}>{reportes.length}</span>
                </h2>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID Producto</th>
                            <th>Nombre</th>
                            <th>Categoria</th>
                            <th>Margen Bruto</th>
                            <th>Margen Operacioal</th>
                            <th>Margen Neto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos?.map((producto) => {
                            const margen = getMargen(producto);
                            return (
                            <tr key={producto.id} className={styles.tableRow}>
                                <td>{producto.id}</td>
                                <td>{producto.nombre}</td>
                                <td>{getCategoryProduct(producto.categoria)}</td>
                                <td className={styles.margen}>
                                    <span className={styles.percentage}>
                                        {margen.margenGross.porcentaje}%
                                    </span>
                                </td>
                                <td className={styles.margen}>
                                    <span className={styles.percentage}>
                                        {margen.margenOperating.porcentaje}%
                                    </span>
                                </td>
                                <td className={styles.margen}>
                                    <span className={styles.percentage}>
                                        {margen.margenNeto.porcentaje}%
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={styles.viewButton}
                                        onClick={() => {
                                            setCategorySelected(producto.categoria);
                                            router.push(`/productos/${producto.id}`);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.icon}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
