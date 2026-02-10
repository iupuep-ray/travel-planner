import Skeleton from '../ui/Skeleton';

const MemberCardSkeleton = () => {
  return (
    <div className="rounded-[24px] shadow-soft p-4 mb-3 bg-white">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width="64px" height="64px" />
        <div className="flex-1">
          <Skeleton variant="text" width="50%" className="mb-2" />
          <Skeleton variant="text" width="70%" height="12px" />
        </div>
      </div>
    </div>
  );
};

export default MemberCardSkeleton;
