
import { useRouter } from "next/router";
import fs from 'fs'
import { GetServerSideProps } from "next";
import styles from "./id.module.css"
import path from "path"
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import Head from 'next/head';


export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const dirName = process.cwd()
  const mainDir=path.resolve(dirName, "..");
  const logFileName = path.join(mainDir, "logfiles",`${id}.json`)

  if (!fs.existsSync(logFileName)) {
    return {
      props: {
        id,
        data: null,
      },
    };
  }

  const file = await fs.promises.readFile(logFileName, "utf8");
  const data= JSON.parse(file)
  return {
    props: {
      id,
      data,
    },
  };
};

export default function Page({id,data}:{id:string, data:{content: string; author: string; avatar: string; time: string}[] | null}) {
  const router = useRouter();
  
  if (!id) return <p>Loading...</p>;
  if (!data) return <h1 className={styles.bigText}>The logs for this channel are not available</h1>

  return (
    <>
    <Head>
        <title>Ticket Logs</title>
        <meta name="description" content="Logs of one ticket channel closed" />
      </Head>
      <main>
    <div className="main">
      {data.map((message) => {
        return (
          <div className={styles.discussion}>
        
          <div className={styles.message}>
            <img src={message.avatar} alt="avatar" className={styles.messageAvatar}/>
            <div className={styles.messageText}>
              <div className={styles.messageHead}>
                <p className={styles.messageAuthor}>{message.author}</p>
                <p className={styles.messageTime}>{message.time}</p>
              </div>
              
              <div className={styles.messageContent}> <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content || "a"}</ReactMarkdown></div>
            </div>
          </div>
          </div>

        )
      })}
    </div>
    </main>
    </>
  );
}
