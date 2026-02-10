import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { usePlanning } from '@/hooks/usePlanning';
import { useMembers } from '@/hooks/useMembers';
import { useSchedules } from '@/hooks/useSchedules';
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
  const { items: planningItems, loading: planningLoading, createItem, editItem, removeItem, toggleItem } = usePlanning(activeTab);
  const { members, loading: membersLoading } = useMembers();
  const { schedules, loading: schedulesLoading } = useSchedules();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanningItem | null>(null);

  const loading = planningLoading || membersLoading || schedulesLoading;

  // 取得成員名稱
  const getMemberName = (memberId: string): string => {
    const member = members.find((m) => m.id === memberId);
    return member?.name || '';
  };

  // 依類型篩選清單項目
  const filteredItems = planningItems.filter((item) => item.type === activeTab);

  // 購物清單分組（依商店名稱）
  const groupedShoppingItems = useMemo(() => {
    if (activeTab !== 'shopping') return {};

    const groups: Record<string, PlanningItem[]> = {
      '未分類': [],
    };

    filteredItems.forEach((item) => {
      if (item.relatedScheduleId) {
        // 找到關聯的行程
        const relatedSchedule = schedules.find((s) => s.id === item.relatedScheduleId);
        if (relatedSchedule && relatedSchedule.type === 'shopping') {
          const shopName = relatedSchedule.name;
          if (!groups[shopName]) {
            groups[shopName] = [];
          }
          groups[shopName].push(item);
        } else {
          groups['未分類'].push(item);
        }
      } else {
        groups['未分類'].push(item);
      }
    });

    // 移除空的未分類群組
    if (groups['未分類'].length === 0) {
      delete groups['未分類'];
    }

    return groups;
  }, [activeTab, filteredItems, schedules]);

  // 切換完成狀態
  const toggleItemDone = async (itemId: string) => {
    const item = planningItems.find((i) => i.id === itemId);
    if (!item) return;
    try {
      await toggleItem(itemId, !item.isDone);
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
        assigneeIds: data.assigneeIds,
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
      await editItem(editingItem.id, {
        content: data.content,
        assigneeIds: data.assigneeIds,
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

  return (
    <div className="pb-20 relative z-10">
      {/* Header */}
      <div
        className="text-white py-6 px-4 mb-4 rounded-b-[40px] relative z-10"
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
        ) : activeTab === 'shopping' ? (
          // 購物清單 - 分組顯示
          <div className="space-y-4">
            {Object.entries(groupedShoppingItems).map(([shopName, items]) => (
              <div key={shopName}>
                {/* 商店分類標題 */}
                <div className="flex items-center gap-2 mb-2 px-2">
                  <FontAwesomeIcon
                    icon={['fas', shopName === '未分類' ? ICON_NAMES.SHOPPING : ICON_NAMES.MAP_LOCATION]}
                    className="text-brown opacity-40 text-sm"
                  />
                  <h3 className="text-sm font-bold text-brown opacity-60">{shopName}</h3>
                  <div className="flex-1 h-px bg-brown/10"></div>
                </div>

                {/* 商店的購物項目 */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-[20px] shadow-soft p-4 transition-all ${
                        item.isDone ? 'bg-white/50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItemDone(item.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 ${
                            item.isDone
                              ? 'bg-primary border-primary'
                              : 'border-brown/30 hover:border-primary'
                          }`}
                        >
                          {item.isDone && (
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
                              item.isDone
                                ? 'text-brown opacity-40 line-through'
                                : 'text-brown'
                            }`}
                          >
                            {item.content}
                          </p>
                          {item.assigneeIds && item.assigneeIds.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {item.assigneeIds.map((assigneeId) => (
                                <div key={assigneeId} className="flex items-center gap-1">
                                  <div
                                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{ backgroundColor: '#7AC5AD' }}
                                  >
                                    {getMemberName(assigneeId).charAt(0)}
                                  </div>
                                  <span className="text-xs text-brown opacity-60">
                                    {getMemberName(assigneeId)}
                                  </span>
                                </div>
                              ))}
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Todo 和行李清單 - 一般列表顯示
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-[20px] shadow-soft p-4 transition-all ${
                  item.isDone ? 'bg-white/50' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItemDone(item.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 ${
                      item.isDone
                        ? 'bg-primary border-primary'
                        : 'border-brown/30 hover:border-primary'
                    }`}
                  >
                    {item.isDone && (
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
                        item.isDone
                          ? 'text-brown opacity-40 line-through'
                          : 'text-brown'
                      }`}
                    >
                      {item.content}
                    </p>
                    {/* Related Schedule or Assignees */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ backgroundColor: '#7AC5AD' }}
                              >
                                {getMemberName(assigneeId).charAt(0)}
                              </div>
                              <span className="text-xs text-brown opacity-60">
                                {getMemberName(assigneeId)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
            ))}
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
            }}
            onSubmit={handleEditItem}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </BottomSheet>
    </div>
  );
};

export default Planning;
