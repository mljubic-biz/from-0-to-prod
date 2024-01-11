import Head from "next/head";
import { api } from "~/utils/api";
import { type GetStaticProps, type NextPage } from "next";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ssgHelper from "~/server/helpers/ssgHelper";

dayjs.extend(relativeTime);

const PostPage: NextPage<{ postId: string }> = ({ postId }) => {
  const { data, isLoading } = api.post.getById.useQuery({
    id: postId,
  });

  return (
    <>
      <Head>
        <title>
          {data?.content} - @{data?.author.emailAddress}
        </title>
      </Head>
      <PageLayout>
        {isLoading && <LoadingPage />}
        {!data && !isLoading && <div>404</div>}
        {data && <PostView post={data} />}
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = ssgHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.post.getById.prefetch({ id: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId: id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default PostPage;
