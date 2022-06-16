import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"

const links = [
  {
    text: "Загрузить рейтинги",
    url: "recsys",
    description:
      "Перейдите по ссылке и загрузите рейтинги товаров или услуг своего сайта в формате *.csv, чтобы получить рекомендации для всех ваших клиентов!",
  },
  {
    text: "Как это работает?",
    url: "",
    description:
      "После загрузки рейтингов, алгоритмы искусственного интеллекта обучатся на ваших данных и составят списки рекомендаций!",
  },
  {
    text: "Интегрировать с сайтом",
    url: "integr",
    description:
      "Персонализация вашего сайта",
  },

  
]


const utmParameters = `?utm_source=starter&utm_medium=start-page&utm_campaign=default-starter`

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <div className={styles.textCenter}>
      <h1>
        <b>Персонализатор</b>
      </h1>
      <h2>
        <b>Рекомендации. Быстро.</b>
      </h2>
    </div>
    <ul className={styles.list}>
      {links.map(link => (
        <li key={link.url} className={styles.listItem}>
          <a
            className={styles.listItemLink}
            href={`${link.url}${utmParameters}`}
          >
            {link.text} 
          </a>
          <p className={styles.listItemDescription}>{link.description}</p>
        </li>
      ))}
    </ul>
  </Layout>
)

export default IndexPage
