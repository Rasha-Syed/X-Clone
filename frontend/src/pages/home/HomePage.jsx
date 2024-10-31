import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [theme, setTheme] = useState("light"); // State for theme
  const [followingUsers, setFollowingUsers] = useState([]); // New state for followed users

  const navigate = useNavigate();

  useEffect(() => {
    // Set initial theme from localStorage (if available)
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    if (feedType === "following") {
      const fetchFollowingUsers = async () => {
        try {
          const res = await fetch("/api/users/suggested"); // Adjust this endpoint as needed
          const data = await res.json();
          setFollowingUsers(data);
        } catch (error) {
          console.error("Error fetching followed users:", error);
        }
      };

      fetchFollowingUsers();
    }
  }, [feedType]); // Fetch followed users when "Following" is selected

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`/api/users/profile/${searchQuery}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.message || "User not found");
        return;
      }

      setSearchError(null);
      navigate(`/profile/${data.username}`);
    } catch (error) {
      console.error("Search Error: ", error);
      setSearchError("User not found");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme); // Save theme in localStorage
  };

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        {/* Header */}
        <div className="flex w-full border-b border-gray-700 justify-between items-center p-4">
          <div className="flex space-x-4">
            <div
              className={`flex justify-center p-3 transition duration-300 cursor-pointer relative ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-secondary"}`}
              onClick={() => setFeedType("forYou")}
            >
              For you
              {feedType === "forYou" && (
                <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
              )}
            </div>
            <div
              className={`flex justify-center p-3 transition duration-300 cursor-pointer relative ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-secondary"}`}
              onClick={() => setFeedType("following")}
            >
              Following
              {feedType === "following" && (
                <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
              )}
            </div>
          </div>
          {/* Theme Switch Button */}
          <button className="btn btn-outline" onClick={toggleTheme}>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            placeholder="Search for a user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary w-full" onClick={handleSearch}>
            Search
          </button>

          {searchError && (
            <p className="text-red-500 text-center mt-2">{searchError}</p>
          )}
        </div>

        {/* CREATE POST INPUT */}
        <CreatePost />

        {/* POSTS */}
        {feedType === "forYou" ? (
          <Posts feedType={feedType} />
        ) : (
          /* Following Users Section */
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Following</h2>
            {followingUsers.length > 0 ? (
              followingUsers.map((user) => (
                <div key={user._id} className="flex items-center mb-3 border-b pb-2">
                  <img
                    src={user.profileImg || '/default-profile.png'}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">{user.fullName}</h3>
                    <p className="text-gray-500">@{user.username}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No followed users found.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
