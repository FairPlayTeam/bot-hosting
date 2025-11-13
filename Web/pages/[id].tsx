//web/pages/[id].tsx
import { useRouter } from "next/router";
import fs from 'fs'
import { GetServerSideProps } from "next";
import styles from "./id.module.css"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const path = `../../logfiles/${id}.js`;

  if (!fs.existsSync(path)) {
    return {
      props: {
        id,
        data: null,
      },
    };
  }

  const data = await fs.promises.readFile(path, "utf8");

  return {
    props: {
      id,
      data,
    },
  };
};

export default function Page({id,data}:{id:string, data:any}) {
  const router = useRouter();
  
  if (!id) return <p>Loading...</p>;
  if (!data) return <h1 className={styles.bigText}>The logs for this channel are not available</h1>

  return (
    <div className="main">
      <p>test, id : {id}</p>
    </div>
  );
}
