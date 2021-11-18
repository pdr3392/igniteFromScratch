import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
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

export default function Home({ postsPagination }: HomeProps) {
  const { results } = postsPagination;

  const firstPosts = results.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    ),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const [postResults, setPostResults] = useState<Post[]>(firstPosts);

  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function loadMorePosts() {
    const finalData: PostPagination = await fetch(nextPage)
      .then(result => result.json())
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error(error);
      });

    const nextFinalResults = finalData.results.map(currentPost => ({
      uid: currentPost.uid,
      first_publication_date: format(
        new Date(currentPost.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
      data: {
        title: currentPost.data.title,
        subtitle: currentPost.data.subtitle,
        author: currentPost.data.author,
      },
    }));

    nextFinalResults.map(post => setPostResults([...postResults, post]));
    setNextPage(finalData.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>
      <body>
        <Header />
        <main
          className={`${commonStyles.container} ${styles.contentContainer}`}
        >
          {postResults.map(post => (
            <div key={post.uid} className={styles.postContainer}>
              <Link href={`post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <time>
                    <FiCalendar size="20" className={styles.icons} />
                    {post.first_publication_date}
                    <p>
                      <FiUser size="20" className={styles.icons} />
                      {post.data.author}
                    </p>
                  </time>
                </a>
              </Link>
            </div>
          ))}
          {nextPage && (
            <button
              type="button"
              onClick={loadMorePosts}
              className={styles.loadMore}
            >
              Carregar mais posts
            </button>
          )}
        </main>
      </body>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response: PostPagination = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  return {
    props: {
      postsPagination: response,
    },
    revalidate: 60 * 60, // 1hr
  };
};
