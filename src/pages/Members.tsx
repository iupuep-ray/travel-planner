import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { useMembers } from '@/hooks/useMembers';
import BottomSheet from '@/components/BottomSheet';
import MemberForm, { MemberFormData } from '@/components/MemberForm';
import MemberCardSkeleton from '@/components/skeletons/MemberCardSkeleton';
import { getDefaultAvatar } from '@/utils/avatar';
import type { Member } from '@/types';

const Members = () => {
  const { members, loading, createMember, editMember, removeMember } = useMembers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // 新增成員
  const handleAddMember = async (data: MemberFormData) => {
    try {
      await createMember({
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('新增成員失敗:', error);
      alert('新增成員失敗，請稍後再試');
    }
  };

  // 編輯成員
  const handleEditMember = async (data: MemberFormData) => {
    if (!editingMember) return;
    try {
      await editMember(editingMember.id, {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      });
      setEditingMember(null);
    } catch (error) {
      console.error('編輯成員失敗:', error);
      alert('編輯成員失敗，請稍後再試');
    }
  };

  // 刪除成員
  const deleteMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
    } catch (error) {
      console.error('刪除成員失敗:', error);
      alert('刪除成員失敗，請稍後再試');
    }
  };

  // 開啟編輯表單
  const openEditForm = (member: Member) => {
    setEditingMember(member);
  };

  return (
    <>
      {/* Header */}
      <div
        className="sticky top-0 text-white pb-6 pt-[calc(var(--app-safe-top)+1.5rem)] px-4 mb-4 rounded-b-[40px] relative z-30"
        style={{ backgroundColor: '#C88EA7' }}
      >
        <div className="flex items-center justify-center gap-3">
          <FontAwesomeIcon icon={['fas', ICON_NAMES.USERS]} className="text-4xl" />
          <div>
            <h1 className="text-2xl font-bold">成員管理</h1>
            <p className="text-sm opacity-90">管理旅行團隊成員</p>
          </div>
        </div>
      </div>

      <div className="pb-20 relative z-10">
        {/* Content */}
        <div className="px-4 relative z-10">
          {loading ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <MemberCardSkeleton key={i} />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div
              className="text-center py-16 rounded-[40px] shadow-soft"
              style={{ backgroundColor: '#F5EFE1' }}
            >
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={['fas', ICON_NAMES.USERS]}
                  className="text-6xl text-brown opacity-20"
                />
              </div>
              <p className="text-brown opacity-60 mb-2">尚無成員</p>
              <p className="text-brown opacity-40 text-sm">點擊下方按鈕新增成員</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[24px] shadow-soft p-5 bg-white transition-transform active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: '#7AC5AD' }}
                    >
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src={getDefaultAvatar(member.id || member.email || member.name)}
                          alt={`${member.name} 預設頭像`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-brown mb-1">{member.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-brown opacity-60">
                        <FontAwesomeIcon icon={['fas', ICON_NAMES.EMAIL]} className="text-xs" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditForm(member)}
                        className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center transition-transform active:scale-95 hover:bg-blue-200"
                      >
                        <FontAwesomeIcon icon={['fas', ICON_NAMES.EDIT]} className="text-sm" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          const message = member.authUid
                            ? `確定要刪除成員「${member.name}」嗎？\n\n⚠️ 此成員有關聯的登入帳號，刪除後該帳號將無法登入。\n此操作無法復原。`
                            : `確定要刪除成員「${member.name}」嗎？\n刪除後將無法復原。`;

                          if (confirm(message)) {
                            deleteMember(member.id);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center transition-transform active:scale-95 hover:bg-red-200"
                      >
                        <FontAwesomeIcon icon={['fas', ICON_NAMES.DELETE]} className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <button
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-soft-lg transition-transform active:scale-95 z-30"
          style={{ backgroundColor: '#C88EA7' }}
          onClick={() => setShowAddForm(true)}
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.ADD]} className="text-2xl text-white" />
        </button>

        {/* Add Member Form Bottom Sheet */}
        <BottomSheet isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
          {showAddForm && (
            <MemberForm onSubmit={handleAddMember} onCancel={() => setShowAddForm(false)} />
          )}
        </BottomSheet>

        {/* Edit Member Form Bottom Sheet */}
        <BottomSheet isOpen={!!editingMember} onClose={() => setEditingMember(null)}>
          {editingMember && (
            <MemberForm
              initialData={{
                name: editingMember.name,
                email: editingMember.email,
                avatar: editingMember.avatar,
              }}
              onSubmit={handleEditMember}
              onCancel={() => setEditingMember(null)}
            />
          )}
        </BottomSheet>
      </div>
    </>
  );
};

export default Members;
