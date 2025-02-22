export const header = [
  { key: "nombre", label: "Nombre" },
  { key: "acciones", label: "Acciones" },
];

export const formatearValorCosto = (valor: number) => {
  return (valor / 100).toFixed(3);
};

export const desformatearValorCosto = (valor: number) => {
  const valorFormateado = String(valor);
  return parseFloat(valorFormateado) * 100;
};