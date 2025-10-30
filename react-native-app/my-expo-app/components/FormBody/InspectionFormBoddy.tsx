import React, { useMemo, useReducer } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

/** ---------- Types (data-driven) ---------- */
type Option = { id: string; label: string };
type TaskRow = {
  id: string;
  type: 'task'; // row with checkbox chips
  description: string;
  options: Option[]; // up to 5
  maxSelect?: number; // default 1 (single-choice). set >1 for multi-select
};

type TextRow = {
  id: string;
  type: 'text';
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

type RadioRow = {
  id: string;
  type: 'radio';
  label: string;
  options: Option[]; // classic single-choice
};

type SubSection = {
  id: string;
  title: string;
  rows: Array<TaskRow | TextRow | RadioRow>;
};

type MainSection = {
  id: string;
  title: string;
  subsections: SubSection[];
};

type InspectionPlan = {
  id: string;
  title: string;
  sections: MainSection[];
};

/** ---------- Example data ---------- */
const demoPlan: InspectionPlan = {
  id: 'plan-2025-10-30',
  title: 'Fahrzeug-Inspektion',
  sections: [
    {
      id: 'sec-elec',
      title: 'Elektrik',
      subsections: [
        {
          id: 'sub-battery',
          title: 'Batterie',
          rows: [
            {
              id: 'task-batt-12v',
              type: 'task',
              description: 'Auto Batterie auf Funktion prüfen (über 12 V)',
              options: [
                { id: 'ok', label: 'In Ordnung' },
                { id: 'not_ok', label: 'Nicht in Ordnung' },
                { id: 'fixed', label: 'Behoben' },
              ],
              maxSelect: 1, // single-choice (behaves like radio)
            },
            {
              id: 'task-cables',
              type: 'task',
              description: 'Kabel/Polklemmen auf Korrosion prüfen',
              options: [
                { id: 'ok', label: 'In Ordnung' },
                { id: 'not_ok', label: 'Nicht in Ordnung' },
                { id: 'fixed', label: 'Behoben' },
              ],
            },
            {
              id: 'txt-notes',
              type: 'text',
              label: 'Bemerkungen',
              placeholder: 'z. B. Korrosion leicht, gereinigt...',
              multiline: true,
            },
          ],
        },
      ],
    },
    {
      id: 'sec-safety',
      title: 'Sicherheit',
      subsections: [
        {
          id: 'sub-lights',
          title: 'Beleuchtung',
          rows: [
            {
              id: 'rad-brakelight',
              type: 'radio',
              label: 'Bremslicht links',
              options: [
                { id: 'works', label: 'Funktioniert' },
                { id: 'broken', label: 'Defekt' },
              ],
            },
            {
              id: 'task-headlights',
              type: 'task',
              description: 'Scheinwerfer prüfen',
              options: [
                { id: 'ok', label: 'In Ordnung' },
                { id: 'adjust', label: 'Einstellung nötig' },
                { id: 'fixed', label: 'Behoben' },
                { id: 'n_a', label: 'N/A' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** ---------- Form state ---------- */
type FormState = {
  // keyed by row.id
  taskSelections: Record<string, string[]>; // array of option ids
  textValues: Record<string, string>;
  radioValues: Record<string, string | null>;
};

type Action =
  | { type: 'TASK_TOGGLE'; rowId: string; optionId: string; maxSelect: number }
  | { type: 'TEXT_SET'; rowId: string; value: string }
  | { type: 'RADIO_SET'; rowId: string; optionId: string }
  | { type: 'RESET' };

const initialState: FormState = {
  taskSelections: {},
  textValues: {},
  radioValues: {},
};

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'TASK_TOGGLE': {
      const current = state.taskSelections[action.rowId] ?? [];
      let next: string[];
      if (action.maxSelect <= 1) {
        // single choice: replace
        next = [action.optionId];
      } else {
        // multi-select with cap
        const exists = current.includes(action.optionId);
        if (exists) {
          next = current.filter((id) => id !== action.optionId);
        } else if (current.length < action.maxSelect) {
          next = [...current, action.optionId];
        } else {
          // replace last chosen with new (or ignore) – choose behavior; here we replace the last
          next = [...current.slice(1), action.optionId];
        }
      }
      return {
        ...state,
        taskSelections: { ...state.taskSelections, [action.rowId]: next },
      };
    }
    case 'TEXT_SET':
      return {
        ...state,
        textValues: { ...state.textValues, [action.rowId]: action.value },
      };
    case 'RADIO_SET':
      return {
        ...state,
        radioValues: { ...state.radioValues, [action.rowId]: action.optionId },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

/** ---------- Small UI atoms ---------- */
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
    <Text className="mb-3 text-lg font-semibold">{title}</Text>
    {children}
  </View>
);

const SubHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text className="mb-2 text-base font-medium text-gray-700">{title}</Text>
);

const Chip: React.FC<{ selected?: boolean; label: string; onPress: () => void }> = ({
  selected,
  label,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    className={`rounded-xl border px-3 py-2 ${selected ? 'border-black bg-black/90' : 'border-gray-300 bg-white'}`}
    android_ripple={{ color: '#e5e7eb' }}>
    <Text className={`${selected ? 'text-white' : 'text-gray-800'} text-sm`}>{label}</Text>
  </Pressable>
);

/** ---------- Row renderers ---------- */
const TaskRowView: React.FC<{
  row: TaskRow;
  selected: string[];
  onToggle: (optionId: string) => void;
}> = ({ row, selected, onToggle }) => (
  <View className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
    <Text className="mb-2 text-[15px] font-medium text-gray-900">{row.description}</Text>
    <View className="flex-row flex-wrap gap-2">
      {row.options.slice(0, 5).map((opt) => (
        <Chip
          key={opt.id}
          label={opt.label}
          selected={selected.includes(opt.id)}
          onPress={() => onToggle(opt.id)}
        />
      ))}
    </View>
  </View>
);

const TextRowView: React.FC<{
  row: TextRow;
  value: string;
  onChange: (v: string) => void;
}> = ({ row, value, onChange }) => (
  <View className="mb-3">
    <Text className="mb-1 text-[15px] text-gray-700">{row.label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={row.placeholder}
      multiline={row.multiline}
      className={`rounded-xl border border-gray-300 px-3 py-2 text-base ${row.multiline ? 'min-h-[96px]' : ''}`}
      textAlignVertical={row.multiline ? 'top' : 'auto'}
    />
  </View>
);

const RadioRowView: React.FC<{
  row: RadioRow;
  value: string | null;
  onChange: (optionId: string) => void;
}> = ({ row, value, onChange }) => (
  <View className="mb-3">
    <Text className="mb-2 text-[15px] font-medium text-gray-900">{row.label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {row.options.map((opt) => (
        <Chip
          key={opt.id}
          label={opt.label}
          selected={value === opt.id}
          onPress={() => onChange(opt.id)}
        />
      ))}
    </View>
  </View>
);

/** ---------- Main Screen ---------- */
export const InspectionFormBoddy = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const plan = demoPlan; // in real app: load from API/params

  const payload = useMemo(() => {
    // shape you can POST to your API
    return {
      planId: plan.id,
      answers: {
        tasks: state.taskSelections, // { [rowId]: string[] }
        texts: state.textValues, // { [rowId]: string }
        radios: state.radioValues, // { [rowId]: string|null }
      },
    };
  }, [plan.id, state]);

  const onSubmit = () => {
    // validate example: ensure each TaskRow with single-choice has exactly 1 selection
    const missing: string[] = [];
    plan.sections.forEach((s) =>
      s.subsections.forEach((sub) =>
        sub.rows.forEach((r) => {
          if (r.type === 'task') {
            const max = r.maxSelect ?? 1;
            if (max === 1) {
              const sel = state.taskSelections[r.id] ?? [];
              if (sel.length !== 1) missing.push(r.description);
            }
          }
          if (r.type === 'radio') {
            const v = state.radioValues[r.id] ?? null;
            if (!v) missing.push(r.label);
          }
        })
      )
    );

    if (missing.length) {
      Alert.alert(
        'Bitte ausfüllen',
        `Es fehlen Angaben zu:\n• ${missing.slice(0, 6).join('\n• ')}${missing.length > 6 ? '\n• …' : ''}`
      );
      return;
    }

    // TODO: POST payload to your backend
    Alert.alert('Gespeichert', 'Formulardaten wurden vorbereitet (siehe console).');
    console.log('SUBMIT PAYLOAD', JSON.stringify(payload, null, 2));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5 pt-6"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled">
        <Text className="mb-4 text-2xl font-semibold">{plan.title}</Text>

        {plan.sections.map((section) => (
          <SectionCard key={section.id} title={section.title}>
            {section.subsections.map((sub) => (
              <View key={sub.id} className="mb-4">
                <SubHeader title={sub.title} />
                {sub.rows.map((row) => {
                  if (row.type === 'task') {
                    const selected = state.taskSelections[row.id] ?? [];
                    return (
                      <TaskRowView
                        key={row.id}
                        row={row}
                        selected={selected}
                        onToggle={(optionId) =>
                          dispatch({
                            type: 'TASK_TOGGLE',
                            rowId: row.id,
                            optionId,
                            maxSelect: row.maxSelect ?? 1,
                          })
                        }
                      />
                    );
                  }
                  if (row.type === 'text') {
                    const value = state.textValues[row.id] ?? '';
                    return (
                      <TextRowView
                        key={row.id}
                        row={row}
                        value={value}
                        onChange={(v) => dispatch({ type: 'TEXT_SET', rowId: row.id, value: v })}
                      />
                    );
                  }
                  if (row.type === 'radio') {
                    const value = state.radioValues[row.id] ?? null;
                    return (
                      <RadioRowView
                        key={row.id}
                        row={row}
                        value={value}
                        onChange={(optionId) =>
                          dispatch({ type: 'RADIO_SET', rowId: row.id, optionId })
                        }
                      />
                    );
                  }
                  return null;
                })}
              </View>
            ))}
          </SectionCard>
        ))}

        {/* Submit / Actions */}
        <View className="mb-10 mt-2 flex-row justify-end gap-3">
          <Pressable
            onPress={() => dispatch({ type: 'RESET' })}
            className="rounded-xl border border-gray-300 px-4 py-3">
            <Text className="text-gray-800">Zurücksetzen</Text>
          </Pressable>
          <Pressable onPress={onSubmit} className="rounded-xl bg-black/90 px-4 py-3">
            <Text className="font-medium text-white">Speichern</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
