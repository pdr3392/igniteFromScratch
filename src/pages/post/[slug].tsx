import { GetStaticPaths, GetStaticProps } from 'next';
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

export default function Post(props) {
  return (
    <>
      <Header />
      <h1>Hello World!</h1>
      <p>{props.slug}</p>
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
  const response: PostProps = await prismic.getByUID('posts', String(slug), {});

  console.log(response);

  /*   const finalObjectParsed = {
    first_publication_date: response.post.first_publication_date,
    data: {
      title: response.post.data.title,
      banner: {
        url: response.post.data.banner.url,
      },
      author: response.post.data.author,
    },
  }; */

  return {
    props: {
      slug,
    },
  };
};
