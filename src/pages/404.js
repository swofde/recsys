import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <Seo title="404: Не найдено" />
    <h1>404: Не найдено</h1>
    <p>Такой страницы, к сожалению, не существует.</p>
  </Layout>
)

export default NotFoundPage
