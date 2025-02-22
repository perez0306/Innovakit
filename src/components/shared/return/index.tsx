import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import styles from "./index.module.css";

const ReturnComponent = () => {
    const router = useRouter();

    const handleReturn = () => {
        router.back();
    }

    return (
        <div className={styles.container} onClick={handleReturn}>
            <ArrowBack className={styles.icon} />
            <span className={styles.text}>Regresar</span>
        </div>
    )
}

export default ReturnComponent;
