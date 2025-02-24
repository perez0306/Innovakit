export const header = [
  { key: "nombre", label: "Nombre" },
  { key: "acciones", label: "Acciones" },
];

export const formatearValorCosto = (valor: number) => {
  return (valor / 100).toFixed(3);
};

export const desformatearValorCosto = (valor: number) => {
  const valorFormateado = String(valor);
  const result = parseFloat(valorFormateado) * 100;
  return result.toFixed(2);
};