import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.imageUrl,
    firstName: user.firstName,
    lastName: user.lastName
  }
}

export const postRouter = createTRPCRouter({
  // Public procedure - no authentication required, everyone can access this.
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }]
    });

    const users = await clerkClient.users.getUserList({
      userId: posts.map(post => post.authorId),
      limit: 100
    });

    const postsWithAuthor = posts.map(post => {
      const author = users.find(user => user.id === post.authorId);
      if (!author) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author not found"});
      }

      return {
        ...post,
        author: { ...filterUserForClient(author), username: author.username }
      }
    });

    return postsWithAuthor;
  }),
  
  crate: privateProcedure.input(z.object({
    content: z.string().min(1).max(280)
  })).mutation(async ({ ctx, input }) => {
    const post = await ctx.db.post.create({
      data: {
        content: input.content,
        authorId: ctx.userId
      }
    })

    return post;
  })
});
