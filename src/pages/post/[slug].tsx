import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
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

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {
  const { post } = props;

  return (
    <>
      <Header />
      <div>
        <img className={styles.bannerImage} src={post.data.banner.url} alt="" />
      </div>

      <div className={styles.contentWrapper}>
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
          <p>Placeholder tempo</p>
        </div>
      </div>

      {/* <div className={styles.postTitle}>
        <h1>{post.data.title}</h1>
      </div>
      <div className={styles.subHeader}>
        <FiCalendar />
        <p>Test</p>
        <FiUser />
        <p>Test</p>
        <FiClock />
        <p>Test</p>
      </div> */}
    </>
  );
}

/* export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query();


}; */

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID('posts', String(slug), {});

  const finalObjectParsed = {
    first_publication_date: response.first_publication_date,
    data: {
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
      post: finalObjectParsed,
    },
  };
};
