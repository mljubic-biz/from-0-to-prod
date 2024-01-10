import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useUtils();

  const { mutate, isLoading: isPosting } = api.post.crate.useMutation({
    onSuccess: async () => {
      await ctx.post.getAll.invalidate();
    },
    onError: (event) => {
      const errorMessage = event.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post!, Please try again later.");
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        alt="Profile image"
        className="h-12 w-12 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button disabled={isPosting} onClick={() => mutate({ content: input })}>
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={16} />
        </div>
      )}
      <SignOutButton />
    </div>
  );
};

type PostWithUser = RouterOutputs["post"]["getAll"][number];
const PostView = ({ post }: { post: PostWithUser }) => {
  const { content, author, createdAt } = post;

  return (
    <div className="flex  gap-4 border-b border-slate-400 p-4">
      <Image
        src={author.profilePicture}
        alt="Profile image"
        className="h-12 w-12 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <Link href={`/@${author.emailAddress}`}>
            <span>{`@${author.emailAddress}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span> · {dayjs(createdAt).fromNow()}</span>
          </Link>
        </div>
        <span className="text-xl">{content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data?.map((post) => <PostView key={post.id} post={post} />)}
    </div>
  );
};

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // Start fetching asap;
  api.post.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        <div className="flex grow justify-center">
          {!isSignedIn && <SignInButton />}
          {isSignedIn && <CreatePostWizard />}
        </div>
      </div>
      <Feed />
    </PageLayout>
  );
}
