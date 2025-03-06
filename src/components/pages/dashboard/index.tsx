import { useEffect, useState } from "react";
import { percentageMargenGross, percentageMargenNeto, percentageMargenOperating } from "@/components/pages/productos/detail/utils";
import styles from "./index.module.css";
import supabase from "@/utils/supabase";
import { fetchDataCosts, getDataInsumo, getDataVendor } from "@/context/refesh";
import { useAppContext } from "@/context/store";
import { useRouter } from "next/navigation";
import { CostI, ProductDataI, ProductI, SupliesI, VendorI } from "@/typings/store";
import { getCostValue, formatMiles } from "@/utils/formated";

export default function Dashboard() {
    const router = useRouter();
    const { setCosts, costs, setCategorySelected, categorySelected } = useAppContext();
    const [productos, setProductos] = useState<ProductI[]>([]);
    const [productosData, setProductosData] = useState<ProductDataI[]>([]);
    const [dataInsumo, setDataInsumo] = useState<SupliesI[]>([]);

    const getMargen = (producto: ProductI) => {
        const costoTotal = producto.insumo.reduce((sum, acc) => {
            const [, cantidad] = acc.split('_');
            const [id, proveedor] = acc.split('-');
            const insumo = dataInsumo.find(i => (String(i.id) === id && i.proveedor === proveedor.split('_')[0]));
            const costo = getCostValue(insumo?.costos || {}) || 0;
            return sum + (costo * Number(cantidad));
        }, 0)
        const costFilter = costs.filter(cost => cost.nombre !== "renta");
        const renta = costs.find(cost => cost.nombre === "renta");
        const costosTotales = costFilter.reduce((acc: number, curr: CostI) => acc + curr.valor * Number(producto.venta), 0);
        const costoVendedor = Number(producto.venta) * (producto.vendedor / 100);
        const costoFinanciero = Number(producto.venta) * (producto.financiero / 100);
        const costoOperacional = costosTotales + costoVendedor + costoFinanciero;

        const margenGross = percentageMargenGross(Number(producto.venta), Number(costoTotal))
        const margenOperating = percentageMargenOperating(Number(producto.venta), Number(margenGross.margen), costoOperacional)
        const margenNeto = percentageMargenNeto(Number(producto.venta), Number(margenOperating.margen), renta?.valor || 0)
        return { margenGross, margenOperating, margenNeto, costoTotal, costoOperacional };
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
            .from('productos')
            .select('*')
            .eq('categoria', categorySelected);

        if (error || !reportes) {
            setProductos([]);
            return;
        }
        setProductos(reportes);
    }

    useEffect(() => {
        refectData();
    }, [categorySelected]);

    useEffect(() => {
        const loadProductos = async () => {
            const productosDatos = await Promise.all(productos.map(async (producto) => {
                const margen = await getMargen(producto);
                return {
                    ...producto,
                    margenGross: margen.margenGross.margen,
                    margenOperating: margen.margenOperating.margen,
                    margenNeto: margen.margenNeto.margen,
                    porcentajeGross: String(margen.margenGross.porcentaje),
                    porcentajeOperating: String(margen.margenOperating.porcentaje),
                    porcentajeNeto: String(margen.margenNeto.porcentaje),
                    costoTotal: margen.costoTotal,
                    costoOperacional: margen.costoOperacional,
                }
            }));

            const productosOrdenados = productosDatos.sort((a, b) => b.margenNeto - a.margenNeto);
            setProductosData(productosOrdenados);
        };

        loadProductos();
    }, [productos, dataInsumo]);

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.title}>Dashboard de Productos</h1>
            <div className={styles.filterContainer}>
                <select
                    name="category"
                    id="category"
                    value={categorySelected}
                    onChange={(e) => setCategorySelected(e.target.value)}
                    className={styles.select}
                >
                    <option value="1">General</option>
                    <option value="2">Marquesina Cafe</option>
                    <option value="3">Marquesina Cacao</option>
                </select>
            </div>

            <div className={styles.summary}>
                <h2 className={styles.subtitle}>
                    Total de Productos: <span className={styles.badge}>{productos.length}</span>
                </h2>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Costo</th>
                            <th>Margen Bruto</th>
                            <th>Margen Operacional</th>
                            <th>Margen Neto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosData?.map((producto) => {
                            return (
                                <tr key={producto.id} className={styles.tableRow}>
                                    <td>{producto.id}</td>
                                    <td>{producto.nombre}</td>
                                    <td>{formatMiles(Number(producto.venta))}</td>
                                    <td>{formatMiles(producto.costoTotal + producto.costoOperacional)}</td>
                                    <td className={styles.margen}>
                                        <span className={styles.percentage}>
                                            ${formatMiles(Number(producto.margenGross))}
                                        </span>
                                    </td>
                                    <td className={styles.margen}>
                                        <span className={styles.percentage}>
                                            ${formatMiles(Number(producto.margenOperating))}
                                        </span>
                                    </td>
                                    <td className={styles.margen}>
                                        <span className={styles.percentage}>
                                            ${formatMiles(Number(producto.margenNeto))}
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
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
