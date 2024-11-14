import { Link } from 'react-router-dom';


const ProfileStats = ({ userId, followerCount, followingCount }) => {
  return (
    <div className="flex justify-center sm:justify-end w-full mt-4 sm:mt-0 sm:w-auto space-x-6 sm:space-x-6">
      <div className="flex flex-col items-center">
        <Link to={`/followers/${userId}`}>
          <p className="text-lg font-semibold cursor-pointer">{followerCount}</p>
        </Link>
        <p className="text-sm text-gray-600 font-semibold">Followers</p>
      </div>

      <div className="flex flex-col items-center">
        <Link to={`/following/${userId}`}>
          <p className="text-lg font-semibold cursor-pointer">{followingCount}</p>
        </Link>
        <p className="text-sm text-gray-600 font-semibold">Following</p>
      </div>
    </div>
  );
};

export default ProfileStats;
