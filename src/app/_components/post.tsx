"use client";

import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const { status } = useSession(); // 👈 セッション取得状態

  const { data: allPosts } = api.post.getAll.useQuery(undefined, {
    enabled: status === "authenticated", // 👈 セッション準備できてから呼ぶ
  });

  const { data: latestPost } = api.post.getLatest.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createPost.mutate({ name });
    setName("");
  };

  return (
    <div className="w-full max-w-xs">
      <h2>All posts</h2>
      <ul className="mb-4 flex max-h-40 flex-col gap-2 overflow-y-auto">
        {allPosts?.map((post) => (
          <li
            key={post.id}
            className="rounded-full flex justify-between bg-white/10 px-4 py-2"
          >
            <p className="text-white">{post.name}</p>
            <button className="ml-2 rounded-full bg-red-500 px-2 py-1 text-sm text-white transition hover:bg-red-600"
              onClick={() => deletePost.mutate({ id: post.id })}
              disabled={deletePost.isPending}
            >削除</button>
          </li>
        ))}
      </ul>
      <h2>Latest post</h2>
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
