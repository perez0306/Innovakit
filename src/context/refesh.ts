import { formatSuplies, formatVendor } from "@/utils/formated";
import supabase from "@/utils/supabase";
import { SupliesI, TableStateI } from "@/typings/store";

export const fetchDataVendor = async (
  setVendor: (vendors: TableStateI[]) => void
) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select()
    .order("nombre", { ascending: true });
  if (error) {
    setVendor([]);
    return;
  }
  const vendorFormat: TableStateI[] = formatVendor(data);
  setVendor(vendorFormat);
};

export const fetchDataInsumo = async (
  setInsumo: (insumo: TableStateI[]) => void
) => {
  const { data, error } = await supabase
    .from("insumos")
    .select()
    .order("descripcion", { ascending: true });
  if (error) {
    setInsumo([]);
    return;
  }
  const sipliesData: SupliesI[] = await Promise.all(
    data.map(async (item: SupliesI) => {
      const { data: dataVendor, error: errorVendor } = await supabase
        .from("proveedores")
        .select()
        .eq("id", item.proveedor);
      return { ...item, proveedor: errorVendor ? "" : dataVendor?.[0].nombre };
    })
  );

  const insumoFormat: TableStateI[] = formatSuplies(sipliesData);
  setInsumo(insumoFormat);
};
