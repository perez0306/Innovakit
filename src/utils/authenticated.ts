"use client";

import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export const useAuthenticated = () => {
    const router = useRouter();

    useEffect(() => {
        const expires = localStorage.getItem("expires");

        if (!expires) {
            router.push("/");
            return;
        }

        const expirationDate = new Date(parseInt(expires) * 1000);
        const currentDate = new Date();

        if (currentDate >= expirationDate) {
            localStorage.removeItem("token");
            localStorage.removeItem("expires");
            router.push("/");
        }
    }, [router]);

    return {};
};

export const useCloseSession = () => {
    const router = useRouter();

    const closeSession = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("expires");
        router.push("/");
    }

    return { closeSession };
}
