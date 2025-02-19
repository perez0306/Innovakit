import { ProductFormI } from "@/typings/components";
import supabase from "@/utils/supabase";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import * as yup from "yup";

export const schema = yup.object().shape({
  id: yup.string().required("El id es requerido"),
  nombre: yup.string().required("El nombre es requerido"),
  lineaNegocio: yup.string().required("La linea de negocio es requerida"),
  valorVenta: yup.string()
    .required("El valor de venta es requerido"),
  otrosCostos: yup.number().required("El campo otros costos es requerido").min(0, "El campo otros costos debe ser mayor a 0").max(100, "El campo otros costos debe ser menor a 100").transform((value) => (isNaN(value) ? undefined : value))
    .typeError('El campo otros costos debe ser un número'),
  insumos: yup.array().of(
    yup.string().required("El campo insumos es requerido")
  ).required("El campo insumos es requerido")
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

  return porcentajeAumento.toFixed(2);
}

export const postProduct = async (dataForm: ProductFormI, ventaFormateada: string, insumosFormateados: string[], router: AppRouterInstance) => {
  const { error } = await supabase
    .from('productos')
    .insert([
      { id: dataForm.id, nombre: dataForm.nombre, linea_negocio: dataForm.lineaNegocio, venta: ventaFormateada, costo_otros: dataForm.otrosCostos, insumo: insumosFormateados },
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

export const updateProduct = async (dataForm: ProductFormI, ventaFormateada: string, insumosFormateados: string[], router: AppRouterInstance) => {
  const { error } = await supabase
    .from('productos')
    .update({ id: dataForm.id, nombre: dataForm.nombre, linea_negocio: dataForm.lineaNegocio, venta: ventaFormateada, costo_otros: dataForm.otrosCostos, insumo: insumosFormateados })
    .eq('id', dataForm.id)
    .select()

  if (error) {
    alert('Error al actualizar el producto');
    return;
  } else {
    alert('Producto actualizado correctamente');
  }
  router.push('/productos');
}