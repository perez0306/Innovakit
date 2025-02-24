import { useEffect, useState } from "react";
import styles from "./index.module.css";
import { ProductI } from "../../../typings/store";
import supabase from "@/utils/supabase";

interface ProductAnalysisI {
    lowMarginProducts: ProductI[];
    highMarginProducts: ProductI[];
    averageMargin: number;
    averageCostIncrease: number;
}

export default function Dashboard() {
    const [analysis, setAnalysis] = useState<ProductAnalysisI>({
        lowMarginProducts: [],
        highMarginProducts: [],
        averageMargin: 0,
        averageCostIncrease: 0
    });

    const getDataProduct = async (categorySelected: string) => {
        const { data: productos, error } = await supabase
            .from('productos')
            .select('*')
            .eq('categoria', categorySelected);

        if (error) {
            alert('Error al obtener el producto');
            return [];
        }

        return productos;
    }

    useEffect(() => {

    }, []);

    return (
        <div className={styles.dashboard}>
            <h1>Dashboard de Productos</h1>

            <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                    <h2>Aumento Promedio de Costos</h2>
                    <p>{analysis.averageCostIncrease.toFixed(2)}%</p>
                </div>

                <div className={styles.metric}>
                    <h2>Margen Promedio</h2>
                    <p>{analysis.averageMargin.toFixed(2)}%</p>
                </div>
            </div>

            <div className={styles.productLists}>
                <div>
                    <h2>Productos con Margen Bajo (&lt;20%)</h2>
                    <ul>
                        {analysis.lowMarginProducts.map(product => (
                            <li key={product.id}>{product.nombre} - Margen: {calculateMargin(product)}%</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2>Productos con Margen Alto (&gt;40%)</h2>
                    <ul>
                        {analysis.highMarginProducts.map(product => (
                            <li key={product.id}>{product.nombre} - Margen: {calculateMargin(product)}%</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
