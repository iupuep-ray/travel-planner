import Skeleton from '../ui/Skeleton';

const ScheduleCardSkeleton = () => {
  return (
    <div className="rounded-[24px] shadow-soft p-4 mb-3 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" className="mb-2" />
            <Skeleton variant="text" width="40%" height="12px" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="30%" height="12px" />
        <Skeleton variant="rectangular" width="80px" height="24px" className="rounded-full" />
      </div>
    </div>
  );
};

export default ScheduleCardSkeleton;
