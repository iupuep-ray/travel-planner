import Skeleton from '../ui/Skeleton';

const ExpenseCardSkeleton = () => {
  return (
    <div className="rounded-[24px] shadow-soft p-4 mb-3" style={{ backgroundColor: '#F5EFE1' }}>
      <div className="mb-3">
        <Skeleton variant="text" width="70%" className="mb-2" />
        <Skeleton variant="text" width="40%" height="12px" />
      </div>
      <div className="flex items-end justify-between">
        <div className="flex-1">
          <Skeleton variant="text" width="40px" height="12px" className="mb-1" />
          <Skeleton variant="text" width="100px" height="24px" className="mb-1" />
          <Skeleton variant="text" width="80px" height="12px" />
        </div>
        <div className="text-right">
          <Skeleton variant="text" width="80px" height="12px" className="mb-1 ml-auto" />
          <Skeleton variant="text" width="100px" height="20px" className="ml-auto" />
        </div>
      </div>
    </div>
  );
};

export default ExpenseCardSkeleton;
