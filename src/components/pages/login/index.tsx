"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./index.module.css";
import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase";

const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        })

        if (error) {
            setError(error.message);
            setIsSubmitting(false);
        } else {
            localStorage.setItem("token", data?.session?.access_token || "");
            localStorage.setItem("expires", data?.session?.expires_at?.toString() || new Date().toISOString());
            router.push("/productos");
        }

    };

    return (
        <div className={styles.login}>
            <div className={styles.image}>
                <Image src="/assets/image/login.png" fill alt='login' title='login' />
            </div>
            <div className={styles.formContent}>
                <div className={styles.formContainer}>
                    <h1 className={styles.h1}>Matriz de costos</h1>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <input
                            type="email"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit" className={styles.button} disabled={isSubmitting}>
                            {isSubmitting ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;