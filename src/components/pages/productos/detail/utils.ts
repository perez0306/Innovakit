import { ProductFormI } from "@/typings/components";
import supabase from "@/utils/supabase";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import * as yup from "yup";

export const schema = yup.object().shape({
  id: yup.string().required("El id es requerido"),
  nombre: yup.string().required("El nombre es requerido"),
  lineaNegocio: yup.string().required("La linea de negocio es requerida"),
  clasificacion: yup.string().required('La clasificación es requerida'),
  valorVenta: yup.string()
    .required("El valor de venta es requerido"),
  otrosCostos: yup.number().required("El campo otros costos es requerido").min(0, "El campo otros costos debe ser mayor a 0").max(100, "El campo otros costos debe ser menor a 100").transform((value) => (isNaN(value) ? undefined : value))
    .typeError('El campo otros costos debe ser un número'),
  insumos: yup.array().of(
    yup.string().required("El campo insumos es requerido")
  ).required("El campo insumos es requerido"),
  vendedor: yup.number().required("El campo vendedor es requerido").min(0, "El campo vendedor debe ser mayor a 0").max(100, "El campo vendedor debe ser menor a 100").transform((value) => (isNaN(value) ? undefined : value))
    .typeError('El campo vendedor debe ser un número'),
  financiero: yup.number().required("El campo financiero es requerido").min(0, "El campo financiero debe ser mayor a 0").max(100, "El campo financiero debe ser menor a 100").transform((value) => (isNaN(value) ? undefined : value))
    .typeError('El campo financiero debe ser un número'),
});

export const getCostOther = (value: number, setCostoTotalInsumos: (value: number) => void, costoTotal: number) => {
  if (value >= 1 && value <= 100) {
    setCostoTotalInsumos(costoTotal * (value / 100));
  } else {
    setCostoTotalInsumos(0);
  }
}

export const percentageCosto = (precioOriginal: number, precioNuevo: number) => {
  const diferencia = precioNuevo - precioOriginal;
  const division = diferencia / precioOriginal;
  const porcentajeAumento = division * 100;

  return porcentajeAumento ? porcentajeAumento?.toFixed(2) : 0;
}

export const postProduct = async (dataForm: ProductFormI, ventaFormateada: string, insumosFormateados: string[], router: AppRouterInstance, categorySelected: string) => {
  const { error } = await supabase
    .from('productos')
    .insert([
      { id: dataForm.id, nombre: dataForm.nombre, linea_negocio: dataForm.lineaNegocio, venta: ventaFormateada, insumo: insumosFormateados, categoria: categorySelected, financiero: dataForm.financiero, vendedor: dataForm.vendedor, clasificacion: dataForm.clasificacion },
    ])
  if (error) {
    if (error.message.includes('duplicate key value violates unique')) {
      alert('El producto ya existe');
    } else {
      alert('Error al crear el producto');
    }
    return;
  } else {
    alert('Producto creado correctamente');
  }
  router.push('/productos');
}

export const updateProduct = async (dataForm: ProductFormI, ventaFormateada: string, insumosFormateados: string[], router: AppRouterInstance, categorySelected: string) => {
  const { error } = await supabase
    .from('productos')
    .update({ id: dataForm.id, nombre: dataForm.nombre, linea_negocio: dataForm.lineaNegocio, venta: ventaFormateada, insumo: insumosFormateados, categoria: categorySelected, financiero: dataForm.financiero, vendedor: dataForm.vendedor, clasificacion: dataForm.clasificacion })
    .eq('id', dataForm.id)
    .eq('categoria', categorySelected)
    .select()

  if (error) {
    alert('Error al actualizar el producto');
    return;
  } else {
    alert('Producto actualizado correctamente');
  }
  router.push('/productos');
}

export const percentageMargenGross = (precio: number, costo: number) => {
  if (precio === 0 || costo === 0) {
    return { margen: 0, porcentaje: 0 };
  }
  const margen = precio - costo;
  const porcentaje = ((margen / precio) * 100).toFixed(2);
  return { margen, porcentaje };
}

export const percentageMargenOperating = (precio: number, margenGross: number, cost: number) => {
  if (precio === 0 || margenGross === 0) {
    return { margen: 0, porcentaje: 0 };
  }
  const margen = margenGross - cost;
  const porcentaje = ((margen / precio) * 100).toFixed(2);
  return { margen, porcentaje };
}

export const percentageMargenNeto = (precio: number, margenOperating: number, renta: number) => {
  if (precio === 0 || margenOperating === 0) {
    return { margen: 0, porcentaje: 0 };
  }

  const rent = margenOperating * renta;
  const margen = margenOperating - rent;
  const porcentaje = ((margen / precio) * 100).toFixed(2);
  return { margen, porcentaje };
}