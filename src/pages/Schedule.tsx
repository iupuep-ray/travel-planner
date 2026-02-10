import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { useSchedules } from '@/hooks/useSchedules';
import { addShoppingItemsFromSchedule, deletePlanningItemsByScheduleId, updateShoppingItemsFromSchedule } from '@/services/planningService';
import FlightCard from '@/components/FlightCard';
import ScheduleCard from '@/components/ScheduleCard';
import BottomSheet from '@/components/BottomSheet';
import ScheduleDetail from '@/components/ScheduleDetail';
import ScheduleForm, { ScheduleFormData } from '@/components/ScheduleForm';
import LoaderGrid from '@/components/ui/loader-grid';
import type { Schedule as ScheduleType, FlightSchedule, ScheduleType as ScheduleTypeEnum, ShoppingSchedule } from '@/types';

type ScheduleTab = 'flight' | 'lodging' | 'restaurant' | 'spot' | 'shopping';

interface TabConfig {
  key: ScheduleTab;
  label: string;
  icon: typeof ICON_NAMES[keyof typeof ICON_NAMES];
}

const tabs: TabConfig[] = [
  { key: 'flight', label: '機票', icon: ICON_NAMES.PLANE },
  { key: 'lodging', label: '住宿', icon: ICON_NAMES.HOTEL },
  { key: 'restaurant', label: '餐廳', icon: ICON_NAMES.UTENSILS },
  { key: 'spot', label: '景點', icon: ICON_NAMES.MAP_LOCATION },
  { key: 'shopping', label: '購物', icon: ICON_NAMES.SHOPPING },
];

const Schedule = () => {
  const { schedules, loading, createSchedule, editSchedule, removeSchedule } = useSchedules();
  const [activeTab, setActiveTab] = useState<ScheduleTab>('flight');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  const [flightDirection, setFlightDirection] = useState<'outbound' | 'return'>('outbound');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleType | null>(null);

  const handleAddSchedule = async (data: ScheduleFormData) => {
    try {
      // 建立行程並取得 ID
      const scheduleData = {
        type: activeTab as ScheduleTypeEnum,
        ...data,
      } as any;

      const scheduleId = await createSchedule(scheduleData);

      // 如果是購物行程且有購物清單，自動新增到準備清單
      if (activeTab === 'shopping' && data.shoppingItems && data.shoppingItems.length > 0) {
        try {
          await addShoppingItemsFromSchedule(scheduleId, data.shoppingItems);
        } catch (err) {
          console.error('新增購物清單項目失敗:', err);
          alert('購物清單項目新增失敗，但行程已建立成功');
        }
      }

      setShowAddForm(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error('新增行程失敗:', error);
      alert('新增行程失敗，請稍後再試');
    }
  };

  const handleEditSchedule = async (data: ScheduleFormData) => {
    if (!editingSchedule) return;
    try {
      await editSchedule(editingSchedule.id, data as any);

      // 如果是購物行程，更新購物清單
      if (editingSchedule.type === 'shopping') {
        try {
          const newItems = data.shoppingItems || [];
          await updateShoppingItemsFromSchedule(editingSchedule.id, newItems);
        } catch (err) {
          console.error('更新購物清單項目失敗:', err);
          alert('購物清單項目更新失敗，但行程已更新成功');
        }
      }

      setShowAddForm(false);
      setEditingSchedule(null);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('編輯行程失敗:', error);
      alert('編輯行程失敗，請稍後再試');
    }
  };

  const handleOpenEdit = () => {
    if (selectedSchedule && selectedSchedule.type !== 'flight') {
      setEditingSchedule(selectedSchedule);
      setSelectedSchedule(null);
      setShowAddForm(true);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      // 如果是購物行程，先刪除關聯的購物清單項目
      if (selectedSchedule.type === 'shopping') {
        try {
          await deletePlanningItemsByScheduleId(selectedSchedule.id);
        } catch (err) {
          console.error('刪除關聯購物清單項目失敗:', err);
          // 繼續執行刪除行程，即使刪除清單項目失敗
        }
      }

      await removeSchedule(selectedSchedule.id);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('刪除行程失敗:', error);
      alert('刪除行程失敗，請稍後再試');
    }
  };

  return (
    <div className="pb-20 relative z-10">
      {/* Tab Bar */}
      <div
        className="sticky top-0 z-20 shadow-soft rounded-b-[24px]"
        style={{ backgroundColor: '#FDFAF3' }}
      >
        <div className="flex justify-around px-2 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-[20px] min-w-[60px] transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'text-brown hover:bg-cream-dark'
              }`}
            >
              <FontAwesomeIcon icon={['fas', tab.icon]} className="text-xl" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-[3rem] mb-4 flex justify-center">
              <LoaderGrid />
            </div>
            <p className="text-brown opacity-60">載入中...</p>
          </div>
        ) : (
          <>
            {/* 機票專屬：去程/回程切換按鈕 */}
            {activeTab === 'flight' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFlightDirection('outbound')}
              className={`flex-1 py-3 px-4 rounded-[20px] font-bold text-sm transition-all ${
                flightDirection === 'outbound'
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-cream text-brown'
              }`}
            >
              <FontAwesomeIcon
                icon={['fas', ICON_NAMES.PLANE]}
                className="mr-2"
                style={{ transform: 'rotate(45deg)' }}
              />
              去程
            </button>
            <button
              onClick={() => setFlightDirection('return')}
              className={`flex-1 py-3 px-4 rounded-[20px] font-bold text-sm transition-all ${
                flightDirection === 'return'
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-cream text-brown'
              }`}
            >
              <FontAwesomeIcon
                icon={['fas', ICON_NAMES.PLANE]}
                className="mr-2"
                style={{ transform: 'rotate(225deg)' }}
              />
              回程
            </button>
          </div>
        )}

        {(() => {
          // 依類型篩選行程
          let filteredSchedules = schedules.filter((s) => s.type === activeTab);

          // 機票進一步依去程/回程篩選
          if (activeTab === 'flight') {
            filteredSchedules = filteredSchedules.filter((s) => {
              const flight = s as FlightSchedule;
              // 假設第一筆是去程，第二筆是回程（可依據實際資料調整邏輯）
              const flightIndex = schedules
                .filter((item) => item.type === 'flight')
                .indexOf(s);
              return flightDirection === 'outbound' ? flightIndex === 0 : flightIndex === 1;
            });
          }

          if (filteredSchedules.length === 0) {
            return (
              <div className="text-center py-12">
                <div className="mb-4">
                  <FontAwesomeIcon
                    icon={['fas', tabs.find((t) => t.key === activeTab)!.icon]}
                    className="text-6xl text-brown opacity-20"
                  />
                </div>
                <p className="text-brown opacity-60 mb-2">
                  尚無{activeTab === 'flight' ? (flightDirection === 'outbound' ? '去程' : '回程') : tabs.find((t) => t.key === activeTab)?.label}行程
                </p>
                {activeTab !== 'flight' && (
                  <p className="text-brown opacity-40 text-sm">點擊下方按鈕新增行程</p>
                )}
              </div>
            );
          }

          // 機票使用專屬卡片
          if (activeTab === 'flight') {
            return (
              <div>
                {filteredSchedules.map((schedule) => (
                  <FlightCard
                    key={schedule.id}
                    flight={schedule as FlightSchedule}
                    onClick={() => setSelectedSchedule(schedule)}
                  />
                ))}
              </div>
            );
          }

          // 其他類型使用通用卡片
          return (
            <div>
              {filteredSchedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onClick={() => setSelectedSchedule(schedule)}
                  showDate={true}
                />
              ))}
            </div>
          );
        })()}
          </>
        )}
      </div>

      {/* Floating Add Button - 機票不顯示 */}
      {!loading && activeTab !== 'flight' && (
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-soft-lg transition-transform active:scale-95 z-30"
          style={{ backgroundColor: '#E9A15A' }}
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.ADD]} className="text-2xl text-white" />
        </button>
      )}

      {/* Detail Bottom Sheet */}
      <BottomSheet
        isOpen={selectedSchedule !== null}
        onClose={() => setSelectedSchedule(null)}
      >
        {selectedSchedule && (
          <ScheduleDetail
            schedule={selectedSchedule}
            onEdit={selectedSchedule.type !== 'flight' ? handleOpenEdit : undefined}
            onDelete={selectedSchedule.type !== 'flight' ? handleDeleteSchedule : undefined}
          />
        )}
      </BottomSheet>

      {/* Add/Edit Schedule Form Bottom Sheet */}
      <BottomSheet
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingSchedule(null);
        }}
      >
        {showAddForm && activeTab !== 'flight' && (
          <ScheduleForm
            type={activeTab as Exclude<ScheduleTypeEnum, 'flight'>}
            onSubmit={editingSchedule ? handleEditSchedule : handleAddSchedule}
            onCancel={() => {
              setShowAddForm(false);
              setEditingSchedule(null);
            }}
            editingSchedule={editingSchedule}
          />
        )}
      </BottomSheet>
    </div>
  );
};

export default Schedule;
