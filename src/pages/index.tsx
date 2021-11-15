import Img, { GetStaticProps } from 'next';
import Link from 'next/link';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ response }: PostPagination) {
  const posts = response.results;

  const nextPage = response.next_page;

  console.log(nextPage);

  return (
    <>
      <head>
        <title>Home | spacetraveling.</title>
      </head>
      <body>
        <Header />
        <main className={styles.contentContainer}>
          {posts.map(post => (
            <div className={styles.postContainer}>
              <Link href="/">
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <time>
                    <FiCalendar size="20" className={styles.icons} />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      { locale: ptBR }
                    )}
                    <p>
                      <FiUser size="20" className={styles.icons} />
                      {post.data.author}
                    </p>
                  </time>
                </a>
              </Link>
            </div>
          ))}
          {nextPage && <p className={styles.loadMore}>Carregar mais posts</p>}
        </main>
      </body>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.title',
        'posts.subtitle',
        'posts.author',
        'posts.content',
        'posts.first_publication_date',
      ],
      pageSize: 2,
    }
  );

  return {
    props: {
      response,
    },
  };
};
