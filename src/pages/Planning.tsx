import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { usePlanning } from '@/hooks/usePlanning';
import { useMembers } from '@/hooks/useMembers';
import { useSchedules } from '@/hooks/useSchedules';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultAvatar } from '@/utils/avatar';
import BottomSheet from '@/components/BottomSheet';
import PlanningForm, { PlanningFormData } from '@/components/PlanningForm';
import LoaderGrid from '@/components/ui/loader-grid';
import type { PlanningType, PlanningItem } from '@/types';

interface TabConfig {
  key: PlanningType;
  label: string;
  icon: typeof ICON_NAMES[keyof typeof ICON_NAMES];
}

const tabs: TabConfig[] = [
  { key: 'todo', label: 'Todo', icon: ICON_NAMES.LIST_CHECK },
  { key: 'luggage', label: '行李', icon: ICON_NAMES.SHOPPING },
  { key: 'shopping', label: '購物', icon: ICON_NAMES.SHOPPING },
];

const Planning = () => {
  const [activeTab, setActiveTab] = useState<PlanningType>('todo');
  const { items: planningItems, loading: planningLoading, createItem, editItem, removeItem } = usePlanning(activeTab);
  const { members, loading: membersLoading } = useMembers();
  const { schedules, loading: schedulesLoading } = useSchedules();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanningItem | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const loading = planningLoading || membersLoading || schedulesLoading;

  const getMemberById = (memberId: string) => members.find((m) => m.id === memberId);

  // 取得成員名稱
  const getMemberName = (memberId: string): string => {
    const member = getMemberById(memberId);
    return member?.name || '';
  };

  const getMemberDisplayName = (memberId: string): string => {
    return getMemberById(memberId)?.name || getMemberName(memberId) || '成員';
  };

  const getMemberAvatar = (memberId: string): string => {
    const member = getMemberById(memberId);
    return member?.avatar || getDefaultAvatar(memberId || member?.name || 'member');
  };

  const memberSectionColors = useMemo(() => {
    const palette = [
      'hsl(210 60% 92%)', // blue
      'hsl(140 55% 92%)', // green
      'hsl(260 55% 92%)', // violet
      'hsl(320 55% 92%)', // pink
      'hsl(180 55% 92%)', // aqua
      'hsl(90 55% 92%)', // lime
    ];
    const map = new Map<string, string>();
    members.forEach((member, index) => {
      map.set(member.id, palette[index % palette.length]);
    });
    return map;
  }, [members]);

  const getMemberSectionColor = (memberId: string): string => {
    return memberSectionColors.get(memberId) || 'hsl(210 60% 92%)';
  };

  const formatDateTime = (value?: string): string => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
  };

  const formatNotificationTime = (notificationAt?: string): string => formatDateTime(notificationAt);

  // 依類型篩選清單項目
  const filteredItems = planningItems.filter((item) => item.type === activeTab);

  const shoppingScheduleNameById = useMemo(() => {
    const map = new Map<string, string>();
    schedules.forEach((schedule) => {
      if (schedule.type === 'shopping') {
        map.set(schedule.id, schedule.name);
      }
    });
    return map;
  }, [schedules]);

  const getDoneByIds = (item: PlanningItem): string[] => {
    if (item.doneByIds && item.doneByIds.length > 0) return item.doneByIds;
    if (item.isDone && item.assigneeIds && item.assigneeIds.length > 0) return item.assigneeIds;
    return [];
  };

  const isMemberDone = (item: PlanningItem, memberId: string): boolean => {
    const doneByIds = getDoneByIds(item);
    return doneByIds.includes(memberId);
  };

  const getShopName = (item: PlanningItem): string => {
    if (!item.relatedScheduleId) return '未分類';
    return shoppingScheduleNameById.get(item.relatedScheduleId) || '未分類';
  };

  const groupItemsByShop = (items: PlanningItem[]): Record<string, PlanningItem[]> => {
    const groups: Record<string, PlanningItem[]> = {};
    items.forEach((item) => {
      const shopName = getShopName(item);
      if (!groups[shopName]) {
        groups[shopName] = [];
      }
      groups[shopName].push(item);
    });
    return groups;
  };

  const memberSections = useMemo(
    () =>
      members.map((member) => ({
        member,
        items: filteredItems.filter((item) => item.assigneeIds?.includes(member.id)),
      })),
    [members, filteredItems]
  );

  const unassignedItems = useMemo(
    () => filteredItems.filter((item) => !item.assigneeIds || item.assigneeIds.length === 0),
    [filteredItems]
  );

  const toggleUnassignedDone = async (item: PlanningItem) => {
    try {
      await editItem(item.id, { isDone: !item.isDone });
    } catch (error) {
      console.error('切換完成狀態失敗:', error);
      alert('切換完成狀態失敗，請稍後再試');
    }
  };

  const toggleMemberDone = async (item: PlanningItem, memberId: string) => {
    const assigneeIds = item.assigneeIds || [];
    if (assigneeIds.length === 0) {
      await toggleUnassignedDone(item);
      return;
    }

    const doneBy = new Set(getDoneByIds(item));
    if (doneBy.has(memberId)) {
      doneBy.delete(memberId);
    } else {
      doneBy.add(memberId);
    }

    const nextDoneByIds = Array.from(doneBy);
    const nextIsDone = assigneeIds.every((id) => doneBy.has(id));

    try {
      await editItem(item.id, {
        doneByIds: nextDoneByIds,
        isDone: nextIsDone,
      });
    } catch (error) {
      console.error('切換完成狀態失敗:', error);
      alert('切換完成狀態失敗，請稍後再試');
    }
  };

  // 刪除項目
  const deleteItemHandler = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('刪除項目失敗:', error);
      alert('刪除項目失敗，請稍後再試');
    }
  };

  // 新增項目
  const handleAddItem = async (data: PlanningFormData) => {
    try {
      await createItem({
        type: activeTab,
        content: data.content,
        isDone: false,
        createdByAuthUid: user?.uid,
        assigneeIds: data.assigneeIds,
        doneByIds: [],
        notificationEnabled: activeTab === 'todo' ? !!data.notificationEnabled : false,
        notificationAt: activeTab === 'todo' ? data.notificationAt : undefined,
        plannedCompletionAt: data.plannedCompletionAt,
        relatedScheduleId: data.relatedScheduleId,
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('新增項目失敗:', error);
      alert('新增項目失敗，請稍後再試');
    }
  };

  // 編輯項目
  const handleEditItem = async (data: PlanningFormData) => {
    if (!editingItem) return;
    try {
      const nextAssigneeIds = data.assigneeIds || [];
      const normalizedDoneByIds = getDoneByIds(editingItem).filter((id) => nextAssigneeIds.includes(id));
      const nextIsDone = nextAssigneeIds.length > 0
        ? nextAssigneeIds.every((id) => normalizedDoneByIds.includes(id))
        : editingItem.isDone;

      await editItem(editingItem.id, {
        content: data.content,
        assigneeIds: nextAssigneeIds,
        doneByIds: nextAssigneeIds.length > 0 ? normalizedDoneByIds : [],
        isDone: nextIsDone,
        notificationEnabled: editingItem.type === 'todo' ? !!data.notificationEnabled : false,
        notificationAt: editingItem.type === 'todo' ? data.notificationAt : undefined,
        plannedCompletionAt: data.plannedCompletionAt,
        relatedScheduleId: data.relatedScheduleId,
      });
      setEditingItem(null);
    } catch (error) {
      console.error('編輯項目失敗:', error);
      alert('編輯項目失敗，請稍後再試');
    }
  };

  // 開啟編輯表單
  const openEditForm = (item: PlanningItem) => {
    setEditingItem(item);
  };

  const toggleSectionCollapsed = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const getSectionDoneCount = (items: PlanningItem[], memberId?: string): number => {
    if (items.length === 0) return 0;
    if (!memberId) {
      return items.filter((item) => item.isDone).length;
    }
    return items.filter((item) => isMemberDone(item, memberId)).length;
  };

  const splitItemsByDone = (
    items: PlanningItem[],
    memberId?: string
  ): { doneItems: PlanningItem[]; pendingItems: PlanningItem[] } => {
    const doneItems: PlanningItem[] = [];
    const pendingItems: PlanningItem[] = [];

    items.forEach((item) => {
      const isItemDone = memberId ? isMemberDone(item, memberId) : item.isDone;
      if (isItemDone) {
        doneItems.push(item);
      } else {
        pendingItems.push(item);
      }
    });

    return { doneItems, pendingItems };
  };

  const renderItemList = (items: PlanningItem[], memberId?: string) => (
    <div className="space-y-2">
      {items.map((item) => {
        const isRowDone = memberId ? isMemberDone(item, memberId) : item.isDone;
        const toggleHandler = memberId
          ? () => toggleMemberDone(item, memberId)
          : () => toggleUnassignedDone(item);
        const plannedCompletionText = formatDateTime(item.plannedCompletionAt);
        const isPlannedOverdue = (() => {
          if (!item.plannedCompletionAt) return false;
          const plannedTime = new Date(item.plannedCompletionAt).getTime();
          if (Number.isNaN(plannedTime)) return false;
          return Date.now() > plannedTime;
        })();

        return (
          <div
            key={`${memberId || 'unassigned'}-${item.id}`}
            className={`rounded-[20px] shadow-soft p-4 transition-all ${
              isRowDone ? 'bg-white/50' : 'bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <button
                onClick={toggleHandler}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 ${
                  isRowDone
                    ? 'bg-primary border-primary'
                    : 'border-brown/30 hover:border-primary'
                }`}
              >
                {isRowDone && (
                  <FontAwesomeIcon
                    icon={['fas', ICON_NAMES.CHECK]}
                    className="text-white text-xs"
                  />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium transition-all ${
                    isRowDone
                      ? 'text-brown opacity-40 line-through'
                      : 'text-brown'
                  }`}
                >
                  {item.content}
                </p>
                {/* Related Schedule or Assignees */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {item.relatedScheduleId && (
                    <span className="text-xs text-brown opacity-60 flex items-center gap-1">
                      <FontAwesomeIcon icon={['fas', ICON_NAMES.MAP_LOCATION]} />
                      來自行程
                    </span>
                  )}
                  {item.assigneeIds && item.assigneeIds.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.assigneeIds.map((assigneeId) => (
                        <div key={assigneeId} className="flex items-center gap-1">
                          <img
                            src={getMemberAvatar(assigneeId)}
                            alt={`${getMemberDisplayName(assigneeId)} 頭像`}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-xs text-brown opacity-60">
                            {getMemberDisplayName(assigneeId)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.type === 'todo' && item.notificationEnabled && item.notificationAt && (
                    <span className="text-xs text-brown opacity-60 flex items-center gap-1">
                      <FontAwesomeIcon icon={['fas', ICON_NAMES.BELL]} />
                      {`提醒時間 ${formatNotificationTime(item.notificationAt)}`}
                    </span>
                  )}
                </div>
                {plannedCompletionText && (
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        isPlannedOverdue ? 'text-rose-500/80' : 'text-brown opacity-60'
                      }`}
                    >
                      <FontAwesomeIcon icon={['fas', ICON_NAMES.CALENDAR]} />
                      {`預計完成 ${plannedCompletionText}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!item.relatedScheduleId && (
                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => openEditForm(item)}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center transition-transform active:scale-95 hover:bg-blue-200"
                  >
                    <FontAwesomeIcon icon={['fas', ICON_NAMES.EDIT]} className="text-sm" />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`確定要刪除「${item.content}」嗎？`)) {
                        deleteItemHandler(item.id);
                      }
                    }}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center transition-transform active:scale-95 hover:bg-red-200"
                  >
                    <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderShoppingGroups = (items: PlanningItem[], memberId?: string) => {
    const groups = groupItemsByShop(items);
    return (
      <div className="space-y-4">
        {Object.entries(groups).map(([shopName, groupItems]) => (
          <div key={`${memberId || 'unassigned'}-${shopName}`}>
            <div className="flex items-center gap-2 mb-2 px-2">
              <FontAwesomeIcon
                icon={['fas', shopName === '未分類' ? ICON_NAMES.SHOPPING : ICON_NAMES.MAP_LOCATION]}
                className="text-brown opacity-40 text-sm"
              />
              <h3 className="text-sm font-bold text-brown opacity-60">{shopName}</h3>
              <div className="flex-1 h-px bg-brown/10"></div>
            </div>
            {renderItemList(groupItems, memberId)}
          </div>
        ))}
      </div>
    );
  };

  const renderSection = (
    label: string,
    items: PlanningItem[],
    memberId?: string,
    avatarUrl?: string,
    borderColor?: string
  ) => {
    const doneCount = getSectionDoneCount(items, memberId);
    const { doneItems, pendingItems } = splitItemsByDone(items, memberId);
    const sectionKey = `${activeTab}:${memberId || 'unassigned'}`;
    const isCollapsed = collapsedSections[sectionKey] || false;
    const sectionBg = borderColor || '#F2F6FF';
    const emptyLabel = memberId ? '目前沒有指派項目' : '目前沒有項目';

    const renderStatusGroup = (title: string, groupItems: PlanningItem[], emptyText: string) => (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs font-bold text-brown/70">{title}</span>
          <span className="text-xs text-brown/50">{groupItems.length}</span>
          <div className="flex-1 h-px bg-brown/10"></div>
        </div>
        {groupItems.length === 0 ? (
          <div className="text-xs text-brown/50 px-2">{emptyText}</div>
        ) : activeTab === 'shopping' ? (
          renderShoppingGroups(groupItems, memberId)
        ) : (
          renderItemList(groupItems, memberId)
        )}
      </div>
    );

    return (
      <div
        className="relative rounded-[28px] px-3 pb-3 pt-5"
        style={{ backgroundColor: sectionBg }}
      >
        <button
          type="button"
          onClick={() => toggleSectionCollapsed(sectionKey)}
          className="relative w-full flex items-center gap-2 mb-2 px-2 text-left"
          aria-expanded={!isCollapsed}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${label} 頭像`}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-brown/10 text-brown flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={['fas', ICON_NAMES.LIST_CHECK]} />
            </div>
          )}
          <h3 className="text-sm font-bold text-brown">{label}</h3>
          {items.length > 0 && (
            <span className="text-xs text-brown/60">{doneCount}/{items.length} 已完成</span>
          )}
          <div className="flex-1 h-px bg-brown/10"></div>
          <FontAwesomeIcon
            icon={['fas', ICON_NAMES.CHEVRON_RIGHT]}
            className={`text-brown/60 text-xs transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
          />
        </button>

        {!isCollapsed && (
          <>
            {items.length === 0 ? (
              <div className="text-xs text-brown/50 px-2">{emptyLabel}</div>
            ) : (
              <div className="space-y-4">
                {renderStatusGroup('未完成', pendingItems, '目前沒有未完成項目')}
                {renderStatusGroup('已完成', doneItems, '目前沒有已完成項目')}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div
        className="sticky top-0 text-white pb-4 pt-[calc(var(--app-safe-top)+0.75rem)] px-4 mb-4 rounded-b-[40px] relative z-30"
        style={{ backgroundColor: '#7AC5AD' }}
      >
        <div className="flex items-center justify-center gap-3">
          <FontAwesomeIcon icon={['fas', ICON_NAMES.LIST_CHECK]} className="text-4xl" />
          <div>
            <h1 className="text-2xl font-bold">準備清單</h1>
            <p className="text-sm opacity-90">旅行前的準備工作</p>
          </div>
        </div>
      </div>

      <div className="pb-20 relative z-10">
        {/* Tab Bar */}
        <div className="px-4 mb-4">
          <div
            className="flex gap-2 p-2 rounded-[24px] relative z-10"
            style={{ backgroundColor: '#FDFAF3' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-4 rounded-[20px] font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-brown'
                }`}
              >
                <FontAwesomeIcon icon={['fas', tab.icon]} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 relative z-10">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-[3rem] mb-4 flex justify-center">
                <LoaderGrid />
              </div>
              <p className="text-brown opacity-60">載入中...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              className="text-center py-16 rounded-[40px] shadow-soft"
              style={{ backgroundColor: '#F5EFE1' }}
            >
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={['fas', tabs.find((t) => t.key === activeTab)!.icon]}
                  className="text-6xl text-brown opacity-20"
                />
              </div>
              <p className="text-brown opacity-60 mb-2">尚無{tabs.find((t) => t.key === activeTab)?.label}項目</p>
              <p className="text-brown opacity-40 text-sm">點擊下方按鈕新增項目</p>
            </div>
          ) : (
            <div className="space-y-6">
              {memberSections.map(({ member, items }) => (
                <div key={member.id}>
                  {renderSection(
                    getMemberDisplayName(member.id),
                    items,
                    member.id,
                    getMemberAvatar(member.id),
                    getMemberSectionColor(member.id)
                  )}
                </div>
              ))}
              {unassignedItems.length > 0 && (
                <div>
                  {renderSection('未指派', unassignedItems, undefined, undefined, '#F1F5F9')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <button
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-soft-lg transition-transform active:scale-95 z-30"
          style={{ backgroundColor: '#7AC5AD' }}
          onClick={() => setShowAddForm(true)}
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.ADD]} className="text-2xl text-white" />
        </button>

        {/* Add Planning Item Form Bottom Sheet */}
        <BottomSheet isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
          {showAddForm && (
            <PlanningForm
              type={activeTab}
              members={members}
              onSubmit={handleAddItem}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </BottomSheet>

        {/* Edit Planning Item Form Bottom Sheet */}
        <BottomSheet isOpen={!!editingItem} onClose={() => setEditingItem(null)}>
          {editingItem && (
            <PlanningForm
              type={editingItem.type}
              members={members}
              initialData={{
                content: editingItem.content,
                assigneeIds: editingItem.assigneeIds || [],
                notificationEnabled: editingItem.notificationEnabled || false,
                notificationAt: editingItem.notificationAt,
                plannedCompletionAt: editingItem.plannedCompletionAt,
              }}
              onSubmit={handleEditItem}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </BottomSheet>
      </div>
    </>
  );
};

export default Planning;
