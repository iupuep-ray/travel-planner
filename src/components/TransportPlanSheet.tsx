import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import type { Schedule, TransportPlan, TransportStep } from '@/types';

interface TransportPlanSheetProps {
  fromSchedule: Schedule | null;
  toSchedule: Schedule | null;
  initialPlans?: TransportPlan[];
  initialSelectedPlanId?: string;
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

  useEffect(() => {
    const seededPlans = initialPlans && initialPlans.length > 0 ? initialPlans : [createEmptyPlan()];
    setPlans(seededPlans);
    setSelectedPlanId(initialSelectedPlanId || seededPlans[0]?.id);
  }, [initialPlans, initialSelectedPlanId, toSchedule?.id]);

  const updateStep = (planId: string, stepId: string, key: 'mode' | 'duration', value: string) => {
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

    const normalizedPlans = plans
      .map((plan) => ({
        ...plan,
        steps: plan.steps
          .map((step) => ({
            ...step,
            mode: step.mode.trim(),
            duration: step.duration.trim(),
          }))
          .filter((step) => step.mode || step.duration),
      }))
      .filter((plan) => plan.steps.length > 0);

    if (normalizedPlans.length === 0) {
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
      normalizedPlans.find((plan) => plan.id === selectedPlanId)?.id || normalizedPlans[0]?.id;

    try {
      setIsSaving(true);
      await onSave({
        transportPlans: normalizedPlans,
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
