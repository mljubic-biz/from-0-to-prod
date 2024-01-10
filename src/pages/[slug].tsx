import Head from "next/head";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { db } from "~/server/db";
import { appRouter } from "~/server/api/root";
import { type GetStaticProps, type NextPage } from "next";
import { PageLayout } from "~/components/layout";
import Image from "next/image";

const ProfilePage: NextPage<{ emailAddress: string }> = ({ emailAddress }) => {
  const { data, isLoading } = api.profile.getUserByEmailAddress.useQuery({
    emailAddress,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>404</div>;

  console.log(data);

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
        <div className="border-b border-slate-400 p-6">
          <div className="h-[48px]" />
          <div className="text-2xl font-bold">{emailAddress}</div>
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const emailAddress = slug.replace("@", "");

  const user = await ssg.profile.getUserByEmailAddress.prefetch({
    emailAddress,
  });

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
