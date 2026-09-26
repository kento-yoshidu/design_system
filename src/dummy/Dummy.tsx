import { useState } from "react";
import styles from "./dummy.module.css";

type Props = {
  label: string;
};

export default function Dummy({
  label,
}: Props) {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p className={styles.label}>label = {label}</p>
      <p className={styles.p}>count = {count}</p>
    </>
  );
}
