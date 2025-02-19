import { formatMiles, formatProduct, formatSuplies, formatVendor, getCostValue } from "@/utils/formated";
import supabase from "@/utils/supabase";
import { CategoryI, ProductI, SupliesI, SupliesStateI, TableStateI } from "@/typings/store";

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

export const getDataInsumo = async (): Promise<SupliesI[]> => {
  const { data, error } = await supabase
    .from("insumos")
    .select()
    .order("id", { ascending: true });
  if (error) {
    return [];
  }
  return data;
}

export const fetchDataInsumo = async (
  setInsumo: (insumo: TableStateI[]) => void
) => {
  const { data, error } = await supabase
    .from("insumos")
    .select()
    .order("id", { ascending: true });
  if (error) {
    setInsumo([]);
    return;
  }
  const sipliesData: SupliesStateI[] = await Promise.all(
    data.map(async (item: SupliesI) => {
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

  const insumoFormat: TableStateI[] = formatSuplies(sipliesData);
  setInsumo(insumoFormat);
};

export const fetchDataProduct = async (
  setProduct: (product: TableStateI[]) => void
) => {
  const { data, error } = await supabase.from("productos").select().order("id", { ascending: true });

  if (error) {
    setProduct([]);
    return;
  }

  const dataProduct = await Promise.all(data.map(async (item: ProductI) => {
    let { data: categorias } = await supabase
      .from('categorias')
      .select()
      .eq("id", item.linea_negocio)
    return {
      ...item,
      linea_negocio: categorias?.[0].child,
      category: categorias?.[0].parent,
      venta: formatMiles(Number(item.venta)),
    };
  }));

  const productFormat: TableStateI[] = formatProduct(dataProduct);
  setProduct(productFormat);
};

export const fetchDataProductDashboard = async () => {
  const { data, error } = await supabase.from("productos").select();
  if (error) {
    return [];
  }

  const dataProduct = await Promise.all(data.map(async (item: ProductI) => {
    let { data: categorias } = await supabase
      .from('categorias')
      .select()
      .eq("id", item.linea_negocio)
    return {
      ...item,
      linea_negocio: categorias?.[0].child,
      category: categorias?.[0].parent,
      venta: formatMiles(Number(item.venta)),
    };
  }));

  return dataProduct;
};

export const fetchDataCategory = async (
  setCategory: (category: CategoryI[]) => void
) => {
  const { data, error } = await supabase.from("categorias").select().order("parent", { ascending: true });
  if (error) {
    setCategory([]);
    return;
  }
  setCategory(data);
};

