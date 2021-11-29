import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import Comments from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    prevPost?: {
      uid: string;
      title: string;
    };
    nextPost?: {
      uid: string;
      title: string;
    };
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
  preview: boolean;
}

export default function Post(props: PostProps) {
  const { post } = props;
  const { preview } = props;
  const router = useRouter();

  const nextChecker = post.data.nextPost.title !== null;
  const prevChecker = post.data.prevPost.title !== null;

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
            {prevChecker ? (
              <div className={styles.paginationItem}>
                <p>{post.data.prevPost.title}</p>
                <Link href={`/post/${post.data.prevPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </div>
            ) : (
              <div className={styles.paginationItem} />
            )}
            {nextChecker ? (
              <div className={styles.paginationItem}>
                <p>{post.data.nextPost.title}</p>
                <Link href={`/post/${post.data.nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </div>
            ) : (
              <div className={styles.paginationItem} />
            )}
          </div>

          <Comments />

          {preview && (
            <aside className={styles.exitPreview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query(
    [
      Prismic.Predicates.at('document.type', 'posts'),
      Prismic.Predicates.dateBefore(
        'document.first_publication_date',
        new Date(response.first_publication_date)
      ),
    ],
    {
      pageSize: 60,
      fetch: ['post.results.uid', 'post.results.title'],
      ref: previewData?.ref ?? null,
    }
  );

  const nextPost = await prismic.query(
    [
      Prismic.Predicates.at('document.type', 'posts'),
      Prismic.Predicates.dateAfter(
        'document.first_publication_date',
        new Date(response.first_publication_date)
      ),
    ],
    {
      pageSize: 60,
      fetch: ['post.results.uid', 'post.results.title'],
      ref: previewData?.ref ?? null,
    }
  );

  const nextOverallDates = nextPost.results.map(
    post => post.first_publication_date
  );
  const prevOverallDates = prevPost.results.map(
    post => post.first_publication_date
  );

  const getLatest = arr => arr.sort((a, b) => new Date(b) - new Date(a))[0];
  const getNewer = arr =>
    arr.sort((a, b) => new Date(b) - new Date(a))[arr.length - 1];

  const nextPostParsed = nextPost.results
    .map(post => {
      if (post.first_publication_date === getNewer(nextOverallDates))
        return post;
    })
    .filter(function (x) {
      return x !== undefined;
    })[0];

  const prevPostParsed = prevPost.results
    .map(post => {
      if (post.first_publication_date === getLatest(prevOverallDates))
        return post;
    })
    .filter(function (x) {
      return x !== undefined;
    })[0];

  const nextChecker = Boolean(nextPostParsed);
  const prevChecker = Boolean(prevPostParsed);

  const propsToReturn = {
    first_publication_date: response.first_publication_date,
    data: {
      prevPost: {
        uid: prevChecker ? prevPostParsed.uid : null,
        title: prevChecker ? prevPostParsed.data.title : null,
      },
      nextPost: {
        uid: nextChecker ? nextPostParsed.uid : null,
        title: nextChecker ? nextPostParsed.data.title : null,
      },
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post: propsToReturn,
      preview,
    },
    revalidate: 60 * 60, // 1 hour
  };
};
