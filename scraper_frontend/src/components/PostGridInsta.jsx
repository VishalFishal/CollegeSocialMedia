import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const PostGridInsta = () => {
  const [posts, setPosts] = useState([]);
  const [profileNames, setProfileNames] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");

  // Fetch all distinct profile names
  useEffect(() => {
    fetch("http://localhost:3000/profileNames")
      .then(res => res.json())
      .then(data => setProfileNames(data));
  }, []);

  // Fetch posts based on selected profile
  useEffect(() => {
    const url = selectedProfile
      ? `http://localhost:3000/posts?profileName=${encodeURIComponent(selectedProfile)}`
      : "http://localhost:3000/posts";
    fetch(url)
      .then(res => res.json())
      .then(data => setPosts(data));
  }, [selectedProfile]);

  return (
    <div className="px-10 py-8">
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Filter by Profile:</label>
        <select
          className="border rounded-lg p-2 text-sm"
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
        >
          <option value="">All Profiles</option>
          {profileNames.map((name, idx) => (
            <option key={idx} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center p-4 pb-0">
              <span className="font-semibold text-sm">{post.profileName}</span>
            </div>
            <img
              src={`http://localhost:3000/${post.localPostImagePath}`}
              alt="Post"
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <p className="text-sm text-gray-800 mb-2">{post.caption}</p>
              <a
                href={post.postUrl}
                className="text-blue-500 underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Instagram
              </a>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostGridInsta;
