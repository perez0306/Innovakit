import { formatMiles, formatProduct, formatSuplies, formatVendor, getCostValue } from "@/utils/formated";
import supabase from "@/utils/supabase";
import { CategoryI, CostI, ProductI, SupliesI, SupliesStateI, TableStateI } from "@/typings/store";

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
  setProduct: (product: TableStateI[]) => void,
  categorySelected: string
) => {
  if (categorySelected) {
    const { data, error } = await supabase.from("productos").select().order("id", { ascending: true }).eq("categoria", categorySelected);
    const productFormat = await getProduct(error, data);
    setProduct(productFormat);
  } else {
    const { data, error } = await supabase.from("productos").select().order("id", { ascending: true });
    const productFormat = await getProduct(error, data);
    setProduct(productFormat);
  }
};

const getProduct = async (error: any, data: any[] | null) => {
  if (error || !data) {
    return [];
  }

  const dataProduct = await Promise.all(data.map(async (item: ProductI) => {
    const { data: categorias } = await supabase
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

  return formatProduct(dataProduct);
}

export const fetchDataProductDashboard = async () => {
  const { data, error } = await supabase.from("productos").select();
  if (error) {
    return [];
  }

  const dataProduct = await Promise.all(data.map(async (item: ProductI) => {
    const { data: categorias } = await supabase
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


export const fetchDataCosts = async (
  setCosts: (costs: CostI[]) => void
) => {
  const { data, error } = await supabase.from("costos").select().order("id", { ascending: true });
  if (error) {
    setCosts([]);
    return;
  }
  setCosts(data);
};

