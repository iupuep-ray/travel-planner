import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { uploadImage } from '@/services/storageService';
import type { Schedule, TransportPlan, TransportStep } from '@/types';

interface TransportPlanSheetProps {
  fromSchedule: Schedule | null;
  toSchedule: Schedule | null;
  initialPlans?: TransportPlan[];
  initialSelectedPlanId?: string | null;
  onCancel: () => void;
  onSave: (payload: {
    transportPlans: TransportPlan[];
    selectedTransportPlanId?: string;
  }) => Promise<void>;
}

const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const createEmptyStep = (): TransportStep => ({
  id: createId('step'),
  mode: '',
  duration: '',
  note: '',
  image: '',
});

const createEmptyPlan = (): TransportPlan => ({
  id: createId('plan'),
  steps: [createEmptyStep()],
});

const getScheduleLabel = (schedule: Schedule | null): string => {
  if (!schedule) return '';
  if (schedule.type === 'flight') {
    return `${schedule.departure.airport} → ${schedule.arrival.airport}`;
  }
  return schedule.name;
};

const TransportPlanSheet = ({
  fromSchedule,
  toSchedule,
  initialPlans,
  initialSelectedPlanId,
  onCancel,
  onSave,
}: TransportPlanSheetProps) => {
  const [plans, setPlans] = useState<TransportPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingImages, setPendingImages] = useState<Record<string, File | null>>({});

  useEffect(() => {
    const seededPlans = initialPlans && initialPlans.length > 0 ? initialPlans : [createEmptyPlan()];
    setPlans(seededPlans);
    setSelectedPlanId(initialSelectedPlanId || seededPlans[0]?.id);
    setPendingImages({});
  }, [initialPlans, initialSelectedPlanId, toSchedule?.id]);

  const updateStep = (
    planId: string,
    stepId: string,
    key: 'mode' | 'duration' | 'note' | 'image',
    value: string
  ) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              steps: plan.steps.map((step) =>
                step.id === stepId ? { ...step, [key]: value } : step
              ),
            }
          : plan
      )
    );
  };

  const renderLinkifiedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline break-all"
          >
            {part}
          </a>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
  };

  const handleImageChange = (planId: string, stepId: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('圖片檔案大小不得超過 5MB');
      return;
    }

    setPendingImages((prev) => ({ ...prev, [stepId]: file }));
    updateStep(planId, stepId, 'image', URL.createObjectURL(file));
  };

  const removeImage = (planId: string, stepId: string) => {
    setPendingImages((prev) => ({ ...prev, [stepId]: null }));
    updateStep(planId, stepId, 'image', '');
  };

  const addPlan = () => {
    const newPlan = createEmptyPlan();
    setPlans((prev) => [...prev, newPlan]);
    setSelectedPlanId(newPlan.id);
  };

  const removePlan = (planId: string) => {
    setPlans((prev) => {
      const nextPlans = prev.filter((plan) => plan.id !== planId);
      if (selectedPlanId === planId) {
        setSelectedPlanId(nextPlans[0]?.id);
      }
      return nextPlans.length > 0 ? nextPlans : [createEmptyPlan()];
    });
  };

  const addStep = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? { ...plan, steps: [...plan.steps, createEmptyStep()] }
          : plan
      )
    );
  };

  const removeStep = (planId: string, stepId: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const nextSteps = plan.steps.filter((step) => step.id !== stepId);
        return {
          ...plan,
          steps: nextSteps.length > 0 ? nextSteps : [createEmptyStep()],
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPlans = await Promise.all(plans
      .map((plan) => ({
        ...plan,
        steps: Promise.all(
          plan.steps.map(async (step) => {
            let image = (step.image || '').trim();
            const pendingFile = pendingImages[step.id];
            if (pendingFile) {
              image = await uploadImage(pendingFile, 'transports');
            }

            return {
              ...step,
              mode: step.mode.trim(),
              duration: step.duration.trim(),
              note: (step.note || '').trim(),
              image,
            };
          })
        ),
      }))
    );

    const resolvedPlans = (await Promise.all(
      normalizedPlans.map(async (plan) => ({
        ...plan,
        steps: (await plan.steps).filter((step) => step.mode || step.duration || step.note || step.image),
      }))
    )).filter((plan) => plan.steps.length > 0);

    if (resolvedPlans.length === 0) {
      try {
        setIsSaving(true);
        await onSave({
          transportPlans: [],
          selectedTransportPlanId: undefined,
        });
      } catch (error) {
        console.error('儲存交通方案失敗:', error);
        alert('儲存交通方案失敗，請稍後再試');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const effectiveSelectedPlanId =
      resolvedPlans.find((plan) => plan.id === selectedPlanId)?.id || resolvedPlans[0]?.id;

    try {
      setIsSaving(true);
      await onSave({
        transportPlans: resolvedPlans,
        selectedTransportPlanId: effectiveSelectedPlanId,
      });
    } catch (error) {
      console.error('儲存交通方案失敗:', error);
      alert('儲存交通方案失敗，請稍後再試');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-2 pb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-brown">交通方式</h2>
          <p className="text-sm text-brown opacity-60 mt-1">
            {getScheduleLabel(fromSchedule)} 到 {getScheduleLabel(toSchedule)}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-cream flex items-center justify-center transition-transform active:scale-95"
        >
          <FontAwesomeIcon icon={['fas', ICON_NAMES.CLOSE]} className="text-brown text-xl" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {plans.map((plan, planIndex) => (
          <div
            key={plan.id}
            className="rounded-[28px] border-2 border-[#E7DDCF] bg-[#FDFAF3] p-4 shadow-soft"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm text-brown opacity-50">方案 {planIndex + 1}</p>
                <label className="flex items-center gap-2 text-sm font-bold text-brown mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlanId === plan.id}
                    onChange={() => setSelectedPlanId(plan.id)}
                    className="w-4 h-4 accent-primary"
                  />
                  顯示在首頁
                </label>
              </div>
              {plans.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePlan(plan.id)}
                  className="px-3 py-2 rounded-[16px] bg-red-100 text-red-500 text-sm font-bold"
                >
                  刪除方案
                </button>
              )}
            </div>

            <div className="space-y-3">
              {plan.steps.map((step, stepIndex) => (
                <div
                  key={step.id}
                  className="rounded-[22px] bg-white p-4 border border-[#EFE4D6]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-brown">
                      {stepIndex === 0 ? '交通資訊' : `轉乘資訊 ${stepIndex}`}
                    </p>
                    {plan.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(plan.id, step.id)}
                        className="text-xs font-bold text-red-500"
                      >
                        移除
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-brown mb-2">交通方式</label>
                      <input
                        type="text"
                        value={step.mode}
                        onChange={(e) => updateStep(plan.id, step.id, 'mode', e.target.value)}
                        className="w-full px-4 py-3 rounded-[18px] bg-[#FFFDF8] border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
                        placeholder="例如：JR、地鐵、步行、計程車"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-brown mb-2">所需時間</label>
                      <input
                        type="text"
                        value={step.duration}
                        onChange={(e) => updateStep(plan.id, step.id, 'duration', e.target.value)}
                        className="w-full px-4 py-3 rounded-[18px] bg-[#FFFDF8] border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
                        placeholder="例如：15 分鐘"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-brown mb-2">備註</label>
                      <textarea
                        value={step.note || ''}
                        onChange={(e) => updateStep(plan.id, step.id, 'note', e.target.value)}
                        className="w-full min-h-[96px] px-4 py-3 rounded-[18px] bg-[#FFFDF8] border-2 border-cream focus:border-primary outline-none transition-colors text-brown resize-none"
                        placeholder="可填寫補充說明，若包含網址會自動轉成可點連結"
                      />
                      {!!step.note?.trim() && (
                        <div className="mt-2 rounded-[14px] bg-[#FBF6ED] px-3 py-2 text-sm text-brown break-words">
                          {renderLinkifiedText(step.note)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-brown mb-2">圖片</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(plan.id, step.id, e.target.files?.[0])}
                        className="block w-full text-sm text-brown file:mr-3 file:rounded-[14px] file:border-0 file:bg-primary file:px-4 file:py-2 file:font-bold file:text-white"
                      />
                      {step.image && (
                        <div className="mt-3">
                          <div className="relative w-full max-w-[220px] overflow-hidden rounded-[18px] border border-[#EFE4D6] bg-[#FFFDF8]">
                            <img
                              src={step.image}
                              alt="交通資訊圖片"
                              className="h-32 w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(plan.id, step.id)}
                            className="mt-2 text-xs font-bold text-red-500"
                          >
                            移除圖片
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addStep(plan.id)}
              className="mt-4 w-full py-3 rounded-[20px] bg-[#D8EADC] text-[#3E7A5E] font-bold transition-transform active:scale-95"
            >
              新增轉乘資訊
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addPlan}
          className="w-full py-4 rounded-[22px] border-2 border-dashed border-[#B89F85] text-brown font-bold bg-white transition-transform active:scale-95"
        >
          新增方案
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 rounded-[24px] bg-primary text-white font-bold shadow-soft transition-transform active:scale-95 disabled:opacity-50"
        >
          {isSaving ? '儲存中...' : '儲存交通方式'}
        </button>
      </form>
    </div>
  );
};

export default TransportPlanSheet;
