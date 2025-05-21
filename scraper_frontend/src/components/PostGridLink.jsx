import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const PostGridLink = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/linkedin_posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pr-40 pl-40 pt-10 pb-10">
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center p-4 pb-0">
            <span className="font-semibold text-sm">{post.profileName}</span>
          </div>
          <img src={`http://localhost:3000${post.imagePath}`} alt="Post" className="w-full h-64 object-cover" />
          <div className="p-4">
            <p className="text-sm text-gray-800 mb-2">{post.caption}</p>
            <a href={post.postUrl} className="text-blue-500 underline text-sm">View on Linkedin</a>
            <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostGridLink;