import Head from "next/head";
import { api } from "~/utils/api";
import { type GetStaticProps, type NextPage } from "next";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ssgHelper from "~/server/helpers/ssgHelper";

dayjs.extend(relativeTime);

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data?.length) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((post) => (
        <PostView post={post} key={post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ emailAddress: string }> = ({ emailAddress }) => {
  const { data, isLoading } = api.profile.getUserByEmailAddress.useQuery({
    emailAddress,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>@{emailAddress}</title>
      </Head>
      <PageLayout>
        <div className="relative h-48 border-b border-slate-400 bg-slate-600">
          <Image
            src={data.profilePicture}
            alt={`${data.emailAddress} profile pic`}
            width={96}
            height={96}
            className="absolute bottom-0 left-0 -mb-[48px] ml-4 rounded-full border-2 border-black"
          />
        </div>
        <div className="border-b border-slate-400">
          <div className="h-[48px]" />
          <div className="p-4 text-2xl font-bold">{emailAddress}</div>
          <ProfileFeed userId={data.id} />
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = ssgHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const emailAddress = slug.replace("@", "");

  await ssg.profile.getUserByEmailAddress.prefetch({ emailAddress });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      emailAddress,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
