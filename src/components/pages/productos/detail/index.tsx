import { useAppContext } from "@/context/store";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "./index.module.css";
import { useEffect, useMemo, useState } from "react";
import { getCostOther, percentageCosto, postProduct, schema, updateProduct } from "./utils";
import { ProductFormI } from "@/typings/components";
import { fetchDataCategory, getDataInsumo } from "@/context/refesh";
import { formatCategory, formatSelectInsumoOptions, percentageMargen, formatMiles, getCostValue, getCostValueLastYear } from "@/utils/formated";
import Select from "react-select";
import { Controller } from "react-hook-form";
import { SupliesI } from "@/typings/store";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";

const ProductDetail = ({ isCreate, id }: { isCreate?: boolean, id?: string }) => {
    const router = useRouter();
    const { setCategory, category } = useAppContext();
    const { register, handleSubmit, formState: { errors }, control, watch, reset } = useForm<ProductFormI>({
        resolver: yupResolver(schema),
        defaultValues: isCreate ? { insumos: [""] } : {
            insumos: [""]
        }
    });

    const [insumo, setInsumo] = useState<SupliesI[]>([]);
    const [costs, setCosts] = useState<number[]>([]);
    const [costsLastYear, setCostsLastYear] = useState<number[]>([]);
    const [costoTotalInsumos, setCostoTotalInsumos] = useState(0);
    const [margen, setMargen] = useState(0);

    const refectData = () => {
        fetchDataCategory(setCategory);
    }

    const onSubmit = async (dataForm: ProductFormI) => {
        const ventaFormateada = dataForm.valorVenta.toString().replace(/,/g, '');
        const insumosEmptys = dataForm.insumos.filter((insumo) => insumo !== "");
        const insumosFormateados = insumosEmptys.map((insumo) => {
            const [id, proveedor] = insumo.split('-');
            return id + "-" + proveedor;
        });

        if (isCreate) {
            postProduct(dataForm, ventaFormateada, insumosFormateados, router);
        } else {
            updateProduct(dataForm, ventaFormateada, insumosFormateados, router);
        }
    };

    const getDataProduct = async () => {
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id', id);

        if (error) {
            alert('Error al obtener el producto');
            return [];
        }

        return productos;
    }

    const getCost = (key: string, index: number) => {
        const [id, proveedor] = key.split('-');
        const getInsumo = insumo.find(i => i.id === id && i.proveedor === proveedor);
        const costAux = getCostValue(getInsumo?.costos || {}) || 0;
        const costAuxLastYear = getCostValueLastYear(getInsumo?.costos || {}) || 0;
        setCosts(prev => {
            const newCosts = [...prev];
            newCosts[index] = costAux;
            return newCosts;
        });
        setCostsLastYear(prev => {
            const newCosts = [...prev];
            newCosts[index] = costAuxLastYear;
            return newCosts;
        });
    }

    const deleteCost = (index: number) => {
        setCosts(prev => {
            const newCosts = [...prev];
            newCosts.splice(index, 1);
            return newCosts;
        });
        setCostsLastYear(prev => {
            const newCosts = [...prev];
            newCosts.splice(index, 1);
            return newCosts;
        });
    }

    const costoTotal = useMemo(() => {
        return costs.reduce((sum, item) => {
            return Number(sum) + Number(item);
        }, 0);
    }, [costs]);

    const costoTotalLastYear = useMemo(() => {
        return costsLastYear.reduce((sum, item) => {
            return Number(sum) + Number(item);
        }, 0);
    }, [costsLastYear]);

    const useMemoCategory = useMemo(() => {
        return formatCategory(category);
    }, [category]);

    const useMemoInsumo = useMemo(() => {
        return formatSelectInsumoOptions(insumo);
    }, [insumo]);

    useEffect(() => {
        refectData();
        getDataInsumo().then(async (data) => {
            const sipliesData: SupliesI[] = await Promise.all(
                data.map(async (item: SupliesI) => {
                    const { data: dataVendor, error: errorVendor } = await supabase
                        .from("proveedores")
                        .select()
                        .eq("id", item.proveedor);
                    return {
                        ...item,
                        id: String(item.id),
                        proveedor: errorVendor ? "" : dataVendor?.[0].nombre,
                    };
                })
            );
            setInsumo(sipliesData)
        }).catch(() => { setInsumo([]) });

    }, []);

    useEffect(() => {
        if (!isCreate) {
            getDataProduct().then((data) => {
                reset({
                    id: data[0]?.id,
                    nombre: data[0]?.nombre,
                    lineaNegocio: data[0]?.linea_negocio,
                    valorVenta: data[0]?.venta,
                    otrosCostos: data[0]?.costo_otros,
                    insumos: data[0]?.insumo,
                });

                data[0]?.insumo.forEach((insumo: string, index: number) => {
                    getCost(insumo, index);
                });
            });
        }
    }, [insumo]);

    useEffect(() => {
        const valorVentaFormateado = valorVenta?.toString().replace(/,/g, '') ?? '0';
        setMargen(Number(valorVentaFormateado) - (costoTotal + costoTotalInsumos));
    }, [costoTotal, costoTotalInsumos]);

    useEffect(() => {
        getCostOther(otrosCostos, setCostoTotalInsumos, costoTotal);
    }, [costoTotal]);

    const valorVenta = watch('valorVenta');
    const otrosCostos = watch('otrosCostos');

    return (
        <div className={styles.container}>
            <h1>{isCreate ? "Crear Producto" : "Editar Producto"}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="id">ID</label>
                    <input
                        {...register("id")}
                        id="id"
                        type="text"
                        placeholder="ID del producto"
                    />
                    {errors.id && <span className={styles.error}>{errors.id.message}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        {...register("nombre")}
                        id="nombre"
                        type="text"
                        placeholder="Nombre del producto"
                    />
                    {errors.nombre && <span className={styles.error}>{errors.nombre.message}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="lineaNegocio">Línea de Negocio</label>
                    <Controller
                        name="lineaNegocio"
                        control={control}
                        render={({ field: { onChange, value, ...field } }) => (
                            <Select
                                {...field}
                                value={useMemoCategory.find(c => c.value === value)}
                                onChange={(option) => onChange(option?.value)}
                                options={useMemoCategory}
                                placeholder="Seleccione una línea"
                                isSearchable
                            />
                        )}
                    />
                    {errors.lineaNegocio && <span className={styles.error}>{errors.lineaNegocio.message}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="valorVenta">Valor de Venta</label>
                    <input
                        {...register("valorVenta")}
                        id="valorVenta"
                        type="text"
                        placeholder="Valor de venta"
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            e.target.value = formattedValue;
                            setMargen(Number(value) - (costoTotal + costoTotalInsumos));
                        }}
                    />
                    {errors.valorVenta && <span className={styles.error}>{errors.valorVenta.message}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label>Insumos</label>
                    <Controller
                        name="insumos"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <div className={styles.insumosContainer}>
                                {value.map((item: string, index: number) => (
                                    <div key={`${item}-${index}`}>
                                        <div className={styles.insumoItem}>
                                            <Select
                                                value={useMemoInsumo.find(i => i.value === item)}
                                                onChange={(option) => {
                                                    if (!value.includes(option?.value ?? '')) {
                                                        const newInsumos = [...value];
                                                        newInsumos[index] = option?.value || '';
                                                        onChange(newInsumos);
                                                        getCost(option?.value || '', index);
                                                    }
                                                }}
                                                options={useMemoInsumo}
                                                placeholder="Seleccione un insumo"
                                                className={styles.insumoSelect}
                                            />
                                            <p className={styles.cantidadInput}>${formatMiles(costs?.[index] ?? 0)}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newInsumos = value.filter((_, i) => i !== index);
                                                    onChange(newInsumos);
                                                    deleteCost(index);
                                                }}
                                                className={styles.deleteButton}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                        {errors?.insumos?.[index] && <span className={styles.error}>{errors.insumos[index].message}</span>}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange([...value, ""]);
                                    }}
                                    className={styles.addButton}
                                >
                                    + Agregar Insumo
                                </button>
                            </div>
                        )}
                    />
                    {errors.insumos && <span className={styles.error}>{errors.insumos.message}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="otrosCostos">Porcentaje de Otros Costos (%)</label>
                    <input
                        {...register("otrosCostos")}
                        id="otrosCostos"
                        type="number"
                        placeholder="Ingrese porcentaje (0-100)"
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            getCostOther(value, setCostoTotalInsumos, costoTotal);
                        }}
                    />
                    {errors.otrosCostos && <span className={styles.error}>{errors.otrosCostos.message}</span>}
                </div>
                <div className={styles.resumenFinanciero}>
                    <div className={styles.cardResumen}>
                        <h3 className={styles.cardTitle}>Costo Total de Insumos</h3>
                        <div className={styles.cardValue}>
                            <span className={styles.moneda}>$</span>
                            <span className={styles.cantidad}>{formatMiles(costoTotal + costoTotalInsumos)}</span>
                        </div>
                    </div>
                    <div className={styles.cardResumen}>
                        <h3 className={styles.cardTitle}>Costo año pasado</h3>
                        <div className={styles.cardValue}>
                            <span className={styles.moneda}>$</span>
                            <span className={styles.cantidad}>{formatMiles(costoTotalLastYear + costoTotalInsumos)}</span>
                            <span className={styles.porcentaje}>
                                ({percentageCosto(costoTotalLastYear, costoTotal)}%)
                            </span>
                        </div>
                    </div>
                    <div className={styles.cardResumen}>
                        <h3 className={styles.cardTitle}>Margen</h3>
                        <div className={styles.cardValue}>
                            <span className={styles.moneda}>$</span>
                            <span className={styles.cantidad}>{formatMiles(margen)}</span>
                            <span className={Number(percentageMargen(margen, Number(valorVenta))) > 30 ?
                                styles.porcentajePositivo :
                                styles.porcentajeNegativo}>
                                ({percentageMargen(margen, Number(valorVenta))}%)
                            </span>
                        </div>
                    </div>
                </div>
                <button type="submit" className={styles.submitButton}>
                    {isCreate ? "Crear Producto" : "Actualizar Producto"}
                </button>
            </form>
        </div>
    );
};

export default ProductDetail;