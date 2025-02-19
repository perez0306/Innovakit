"use client";
import { useParams } from "next/navigation";
import ProductDetail from "@/components/pages/productos/detail";
import Menu from "@/layout/menu";
import { useAuthenticated } from "@/utils/authenticated";

const ProductosId = () => {
    const { id } = useParams() as { id: string };
    useAuthenticated();

    return (
        <>
            <Menu />
            <ProductDetail isCreate={id === '0'} id={id}/>
        </>
    )
}

export default ProductosId;