import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostPathProps {
  uid: string;
}

interface ReturnPathProps {
  results: PostPathProps[];
}

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {
  const { post } = props;
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  function timeCounter(post: Post) {
    let wordCounter = 0;
    post.data.content.map(
      content =>
        (wordCounter += Number(RichText.asText(content.body).split(' ').length))
    );

    return Math.ceil(wordCounter / 200);
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>

      <Header />
      <main>
        <div>
          <img
            className={styles.bannerImage}
            src={post.data.banner.url}
            alt=""
          />
        </div>

        <div className={`${commonStyles.container} ${styles.contentWrapper}`}>
          <h1>{post.data.title}</h1>
          <div className={styles.subContainer}>
            <FiCalendar size="20" />
            <p>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </p>
            <FiUser size="20" />
            <p>{post.data.author}</p>
            <FiClock size="20" />
            <p>{timeCounter(post)} min</p>
          </div>
          {post.data.content.map(currentContent => {
            return (
              <div key={currentContent.heading} className={styles.postWrapper}>
                <h1>{currentContent.heading}</h1>
                <div
                  className={styles.bodyContainer}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(currentContent.body),
                  }}
                />
              </div>
            );
          })}

          <div className={`${commonStyles.container} ${styles.divisionLine}`} />
          <div className={styles.pagination}>
            <div className={styles.paginationItem}>
              <h4>Como Utilizar Hooks</h4>
              <p>Post anterior</p>
            </div>
            <div className={styles.paginationItem}>
              <h4>Como Utilizar Hooks</h4>
              <p>Post anterior</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query();


}; */

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts: ReturnPathProps = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  };
};
