import dayjs from "dayjs";
import Link from "next/link";
import { type RouterOutputs } from "~/utils/api";
import Image from "next/image";

type PostWithUser = RouterOutputs["post"]["getAll"][number];
const PostView = ({ post }: { post: PostWithUser }) => {
  const { content, author, createdAt } = post;
  console.log(dayjs(createdAt).fromNow());
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
        <Link href={`/post/${post.id}`}>
          <span className="text-xl">{content}</span>
        </Link>
      </div>
    </div>
  );
};

export default PostView;
