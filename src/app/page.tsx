import styles from "./page.module.css";
import Login from "@/components/pages/login";

export default function Home() {
  return (
    <main className={styles.page}>
      <Login />
    </main>
  );
}
