import { useAppContext } from "@/context/store";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "./index.module.css";
import { useEffect, useMemo, useState } from "react";
import { getCostOther, percentageCosto, percentageMargenGross, percentageMargenNeto, percentageMargenOperating, postProduct, schema, updateProduct } from "./utils";
import { ProductFormI } from "@/typings/components";
import { fetchDataCategory, fetchDataCosts, getDataInsumo, getDataVendor } from "@/context/refesh";
import { formatCategory, formatSelectInsumoOptions, formatMiles, getCostValue, getCostValueLastYear, getCategoryProduct } from "@/utils/formated";
import Select from "react-select";
import { Controller } from "react-hook-form";
import { CostI, SupliesI, VendorI } from "@/typings/store";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { desformatearValorCosto } from "../../costos/utils";
import ReturnComponent from "@/components/shared/return";

const ProductDetail = ({ isCreate, id }: { isCreate?: boolean, id?: string }) => {
    const router = useRouter();
    const { setCategory, category, setCosts, categorySelected, costs } = useAppContext();
    const [insumo, setInsumo] = useState<SupliesI[]>([]);
    const [costes, setCostes] = useState<number[]>([]);
    const [renta, setRenta] = useState<number>(0);
    const [cantidad, setCantidad] = useState<number[]>([]);
    const [costsLastYear, setCostsLastYear] = useState<number[]>([]);
    const [costoOperacional, setCostoOperacional] = useState(0);
    const [costoTotalInsumos, setCostoTotalInsumos] = useState(0);
    const { register, handleSubmit, formState: { errors }, control, watch, reset, setValue } = useForm<ProductFormI>({
        resolver: yupResolver(schema),
        defaultValues: isCreate ? { insumos: [""] } : {
            insumos: [""]
        }
    });

    const valorVenta = watch('valorVenta');
    const otrosCostos = watch('otrosCostos');
    const vendedor = watch('vendedor');
    const financiero = watch('financiero');

    const refectData = () => {
        fetchDataCategory(setCategory);
        fetchDataCosts(setCosts);
    }

    const onSubmit = async (dataForm: ProductFormI) => {
        const ventaFormateada = dataForm.valorVenta?.toString().replace(/,/g, '') || '0';
        const insumosEmptys = dataForm.insumos?.filter((insumo) => insumo !== "") || [];
        const insumosFormateados = insumosEmptys.map((insumo, index) => {
            const [id, proveedor] = insumo.split('-');
            return id + "-" + proveedor + "_" + cantidad[index];
        });
        if (Number(porcentajeNeto) < 20) {
            await supabase
                .from('alertas')
                .insert({
                    id_producto: dataForm.id,
                    categoria: categorySelected,
                });
        }
        if (isCreate) {
            postProduct(dataForm, ventaFormateada, insumosFormateados, router, categorySelected);
        } else {
            updateProduct(dataForm, ventaFormateada, insumosFormateados, router, categorySelected);
        }

    };

    const getDataProduct = async () => {
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id', id)
            .eq('categoria', categorySelected);

        if (error) {
            alert('Error al obtener el producto');
            return [];
        }

        return productos;
    }

    const getCost = (key: string, index: number, cantidad: number = 1) => {
        const [insumoKey] = key.split('_');
        const [id, proveedor] = insumoKey.split('-');
        const getInsumo = insumo.find(i => i.id === id && i.proveedor === proveedor);
        const costAux = getCostValue(getInsumo?.costos || {}) || 0;
        const costAuxLastYear = getCostValueLastYear(getInsumo?.costos || {}) || 0;
        setCostes(prev => {
            const newCosts = [...prev];
            newCosts[index] = costAux * cantidad;
            return newCosts;
        });
        setCostsLastYear(prev => {
            const newCosts = [...prev];
            newCosts[index] = costAuxLastYear * cantidad;
            return newCosts;
        });
    }

    const deleteCost = (index: number) => {
        setCostes(prev => {
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
        return costes.reduce((sum, item) => {
            return Number(sum) + Number(item);
        }, 0);
    }, [costes]);

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

    const { margen: margenGross, porcentaje: porcentajeGross } = useMemo(() => {
        const valorVentaFormateado = valorVenta?.toString().replace(/,/g, '') || '0';
        return percentageMargenGross(Number(valorVentaFormateado), costoTotal);
    }, [valorVenta, costoTotal]);

    const { margen: margenOperating, porcentaje: porcentajeOperating } = useMemo(() => {
        const valorVentaFormateado = valorVenta?.toString().replace(/,/g, '') || '0';
        return percentageMargenOperating(Number(valorVentaFormateado), margenGross, costoOperacional);
    }, [valorVenta, margenGross, costoOperacional]);

    const { margen: margenNeto, porcentaje: porcentajeNeto } = useMemo(() => {
        const valorVentaFormateado = valorVenta?.toString().replace(/,/g, '') || '0';
        return percentageMargenNeto(Number(valorVentaFormateado), margenOperating, renta);
    }, [valorVenta, margenOperating, renta]);

    const tipoOptions = [
        { value: 'propios', label: 'Propios' },
        { value: 'distribucion', label: 'Distribución' }
    ];

    useEffect(() => {
        refectData();
        getDataVendor().then((vendor: VendorI[]) => {
            getDataInsumo().then(async (data) => {
                const sipliesData: SupliesI[] = await Promise.all(
                    data.map(async (item: SupliesI) => {
                        const vendorAux = vendor.find(v => v.id === item.proveedor);
                        return {
                            ...item,
                            id: String(item.id),
                            proveedor: vendorAux?.nombre || "",
                        };
                    })
                );
                setInsumo(sipliesData)
            }).catch(() => { setInsumo([]) });
        });

        const getCostos = async () => {
            const { data: costosData, error } = await supabase
                .from("costos")
                .select("*");

            if (!error && costosData) {
                const costFilter = costosData.filter(cost => cost.nombre !== "renta");
                const sumaCostos = costFilter.reduce((acc, costo) => acc + (costo.valor || 0), 0);
                const sumFormat = desformatearValorCosto(sumaCostos);
                setValue("otrosCostos", Number(sumFormat));
            }
        };

        getCostos();
    }, []);

    useEffect(() => {
        if (!isCreate) {
            getDataProduct().then((data) => {
                const isumosFormated = data[0]?.insumo.map((insumo: string) => {
                    const [id] = insumo.split('_');
                    return id;
                });
                reset({
                    id: data[0]?.id,
                    nombre: data[0]?.nombre,
                    lineaNegocio: data[0]?.linea_negocio,
                    valorVenta: formatMiles(data[0]?.venta),
                    vendedor: data[0]?.vendedor,
                    financiero: data[0]?.financiero,
                    clasificacion: data[0]?.clasificacion,
                    insumos: isumosFormated,
                });
                data[0]?.insumo.forEach((insumo: string, index: number) => {
                    const [, cantidad] = insumo.split('_');
                    setCantidad(prev => {
                        const newCantidad = [...prev];
                        newCantidad[index] = Number(cantidad);
                        return newCantidad;
                    });
                    getCost(insumo, index, Number(cantidad));
                });
            });
        }
    }, [insumo]);

    useEffect(() => {
        getCostOther(otrosCostos, setCostoTotalInsumos, costoTotal);
    }, [costoTotal]);

    useEffect(() => {
        const valorVentaFormateado = valorVenta?.toString().replace(/,/g, '') || '0';
        const costFilter = costs.filter(cost => cost.nombre !== "renta");
        const renta = costs.find(cost => cost.nombre === "renta");
        setRenta(renta?.valor || 0);
        const costoTotal = costFilter.reduce((acc: number, curr: CostI) => acc + curr.valor * Number(valorVentaFormateado), 0);
        const costoVendedor = Number(valorVentaFormateado) * (vendedor / 100);
        const costoFinanciero = Number(valorVentaFormateado) * (financiero / 100);
        setCostoOperacional(costoTotal + costoVendedor + costoFinanciero);
    }, [costs, valorVenta, vendedor, financiero]);

    return (
        <div className={styles.container}>
            <ReturnComponent />
            <h1>{isCreate ? "Crear Producto" : "Editar Producto"} - {getCategoryProduct(categorySelected)}</h1>
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
                    <label htmlFor="clasificacion">Clasificación</label>
                    <Controller
                        name="clasificacion"
                        control={control}
                        render={({ field: { onChange, value, ...field } }) => (
                            <Select
                                {...field}
                                value={tipoOptions.find(t => t.value === value)}
                                onChange={(option) => onChange(option?.value)}
                                options={tipoOptions}
                                placeholder="Seleccione un tipo"
                            />
                        )}
                    />
                    {errors.clasificacion && <span className={styles.error}>{errors.clasificacion.message}</span>}
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
                            setValue("valorVenta", formattedValue);
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
                                {value?.map((item: string, index: number) => (
                                    <div key={`${item}-${index}`}>
                                        <div className={styles.insumoItem}>
                                            <Select
                                                value={useMemoInsumo.find(i => i.value === item)}
                                                onChange={(option) => {
                                                    if (!value.includes(option?.value ?? '')) {
                                                        const newInsumos = [...value];
                                                        newInsumos[index] = option?.value || '';
                                                        onChange(newInsumos);
                                                        getCost(option?.value || '', index, 1);
                                                        setCantidad(prev => {
                                                            const newCantidad = [...prev];
                                                            newCantidad[index] = 1;
                                                            return newCantidad;
                                                        });
                                                    }
                                                }}
                                                options={useMemoInsumo}
                                                placeholder="Seleccione un insumo"
                                                className={styles.insumoSelect}
                                            />
                                            <input
                                                defaultValue={cantidad[index] || 1}
                                                type="number"
                                                step={categorySelected !== "1" ? "0.1" : "1"}
                                                placeholder="Cantidad"
                                                className={styles.cantidadInput}
                                                onChange={(e) => {
                                                    const cantidad = categorySelected === "1" ? parseInt(e.target.value) : parseFloat(e.target.value);
                                                    if (!isNaN(cantidad)) {
                                                        getCost(value[index], index, cantidad);
                                                        setCantidad(prev => {
                                                            const newCantidad = [...prev];
                                                            newCantidad[index] = cantidad;
                                                            return newCantidad;
                                                        });
                                                    }
                                                }}
                                                min={categorySelected !== "1" ? "0.1" : "1"}
                                            />
                                            <p className={styles.cantidadInput}>${formatMiles(costes?.[index] ?? 0)}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newInsumos = value.filter((_, i) => i !== index);
                                                    onChange(newInsumos);
                                                    deleteCost(index);
                                                    setCantidad(prev => {
                                                        const newCantidad = [...prev];
                                                        newCantidad.splice(index, 1);
                                                        return newCantidad;
                                                    });
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
                                        onChange([...(value || []), ""]);
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
                        disabled
                        value={watch("otrosCostos")}
                    />
                    {errors.otrosCostos && <span className={styles.error}>{errors.otrosCostos.message}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="vendedor">Vendedor (%)</label>
                    <input
                        {...register("vendedor")}
                        id="vendedor"
                        type="text"
                        placeholder="Ingrese porcentaje (0-100)"
                        value={vendedor}
                    />
                    {errors.vendedor && <span className={styles.error}>{errors.vendedor.message}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="financiero">Financiero (%)</label>
                    <input
                        {...register("financiero")}
                        id="financiero"
                        type="number"
                        placeholder="Ingrese porcentaje (0-100)"
                        value={financiero}
                    />
                    {errors.financiero && <span className={styles.error}>{errors.financiero.message}</span>}
                </div>
                <div className={styles.resumenFinanciero}>
                    <h2 className={styles.resumenFinancieroTitle}>Resumen Costos</h2>
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
                        <h3 className={styles.cardTitle}>Costo Operacional</h3>
                        <div className={styles.cardValue}>
                            <span className={styles.moneda}>$</span>
                            <span className={styles.cantidad}>{formatMiles(costoOperacional)}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.resumenFinanciero}>
                    <h2 className={styles.resumenFinancieroTitle}>Resumen Margenes</h2>
                    <div className={styles.cardResumen}>
                        <h3 className={styles.cardTitle}>Margen Bruto</h3>
                        <div className={styles.cardValue}>
                            <span className={styles.moneda}>$</span>
                            <span className={styles.cantidad}>{formatMiles(margenGross)}</span>
                            <span className={Number(porcentajeGross) > 30 ?
                                styles.porcentajePositivo :
                                styles.porcentajeNegativo}>
                                ({Number(porcentajeGross).toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <div className={styles.cardResumen}>
                        <h3 className={styles.cardTitle}>Margen Operacional</h3>
                        <div className={styles.cardValue}>
                            <span className={styles.moneda}>$</span>
                            <span className={styles.cantidad}>{formatMiles(margenOperating)}</span>
                            <span className={Number(porcentajeOperating) > 30 ?
                                styles.porcentajePositivo :
                                styles.porcentajeNegativo}>
                                ({Number(porcentajeOperating).toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <div className={styles.cardResumen}>
                        <h3 className={styles.cardTitle}>Margen Neto</h3>
                        <div className={styles.cardValue}>
                            <span className={styles.moneda}>$</span>
                            <span className={styles.cantidad}>{formatMiles(margenNeto)}</span>
                            <span className={Number(porcentajeNeto) > 30 ?
                                styles.porcentajePositivo :
                                styles.porcentajeNegativo}>
                                ({Number(porcentajeNeto).toFixed(2)}%)
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