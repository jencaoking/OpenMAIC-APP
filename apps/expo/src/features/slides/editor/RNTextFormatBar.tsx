import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useTextEditorStore, type TextAttrs } from './textEditorStore';
import { runActiveTextCommand, type TextCommandPayload } from './activeEditorRegistry';

/**
 * Font list — exact same as Web's configs/font.ts.
 * Each entry's `value` is the CSS font-family name.
 */
const FONTS = [
  { label: 'Default', value: '' },
  { label: '思源黑体', value: 'Noto Sans SC' },
  { label: '思源宋体', value: 'Noto Serif SC' },
  { label: '霞鹜文楷', value: 'LXGW WenKai' },
  { label: '站酷快乐体', value: 'ZCOOL KuaiLe' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Source Sans 3', value: 'Source Sans 3' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Literata', value: 'Literata' },
  { label: 'Source Serif 4', value: 'Source Serif 4' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono' },
];

const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 96;

interface ToggleButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

function ToggleButton({ label, active, onPress, children }: ToggleButtonProps) {
  return (
    <TouchableOpacity
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.toggleButton, active && styles.toggleButtonActive]}
    >
      {children}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function BoldIcon() {
  return <Text style={styles.iconText}>B</Text>;
}
function ItalicIcon() {
  return <Text style={[styles.iconText, { fontStyle: 'italic' }]}>I</Text>;
}
function UnderlineIcon() {
  return <Text style={[styles.iconText, { textDecorationLine: 'underline' }]}>U</Text>;
}
function AlignLeftIcon() {
  return <Text style={styles.iconText}>≡</Text>;
}
function AlignCenterIcon() {
  return <Text style={styles.iconText}>≡</Text>;
}
function AlignRightIcon() {
  return <Text style={styles.iconText}>≡</Text>;
}
function ListIcon() {
  return <Text style={styles.iconText}>•</Text>;
}
function MinusIcon() {
  return <Text style={styles.iconText}>−</Text>;
}
function PlusIcon() {
  return <Text style={styles.iconText}>+</Text>;
}

interface RNTextFormatBarProps {
  elementId: string;
}

export function RNTextFormatBar({ elementId }: RNTextFormatBarProps) {
  const attrs = useTextEditorStore((s) => s.richTextAttrs);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => String(parseInt(attrs.fontsize, 10) || 16));

  const run = useCallback(
    (payload: TextCommandPayload) => runActiveTextCommand(elementId, payload),
    [elementId],
  );

  const currentFontLabel =
    FONTS.find((f) => f.value === attrs.fontname)?.label || attrs.fontname || 'Default';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Font picker */}
        <TouchableOpacity style={styles.fontPicker} onPress={() => setFontPickerOpen(true)}>
          <Text style={styles.fontPickerText} numberOfLines={1}>
            {currentFontLabel}
          </Text>
        </TouchableOpacity>

        {/* Font size stepper */}
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => {
              const n = parseInt(attrs.fontsize, 10) || 16;
              const next = String(Math.max(FONT_SIZE_MIN, n - 2));
              setFontSize(next);
              run({ command: 'fontsize', value: next + 'px' });
            }}
          >
            <MinusIcon />
          </TouchableOpacity>
          <TextInput
            value={fontSize}
            onChangeText={(t) => setFontSize(t.replace(/\D/g, ''))}
            onBlur={() => {
              const n = parseInt(fontSize, 10);
              if (isNaN(n)) {
                setFontSize(String(parseInt(attrs.fontsize, 10) || 16));
                return;
              }
              const clamped = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, n));
              setFontSize(String(clamped));
              if (clamped !== parseInt(attrs.fontsize, 10)) {
                run({ command: 'fontsize', value: clamped + 'px' });
              }
            }}
            keyboardType="numeric"
            style={styles.stepperInput}
          />
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => {
              const n = parseInt(attrs.fontsize, 10) || 16;
              const next = String(Math.min(FONT_SIZE_MAX, n + 2));
              setFontSize(next);
              run({ command: 'fontsize', value: next + 'px' });
            }}
          >
            <PlusIcon />
          </TouchableOpacity>
        </View>

        <Divider />

        {/* Bold, Italic, Underline */}
        <ToggleButton label="Bold" active={attrs.bold} onPress={() => run({ command: 'bold' })}>
          <BoldIcon />
        </ToggleButton>
        <ToggleButton label="Italic" active={attrs.em} onPress={() => run({ command: 'em' })}>
          <ItalicIcon />
        </ToggleButton>
        <ToggleButton
          label="Underline"
          active={attrs.underline}
          onPress={() => run({ command: 'underline' })}
        >
          <UnderlineIcon />
        </ToggleButton>

        {/* Text color indicator */}
        <TouchableOpacity
          style={styles.colorButton}
          onPress={() => {
            // Cycle through a preset color palette
            const colors = [
              '#000000',
              '#ff0000',
              '#00ff00',
              '#0000ff',
              '#ff6600',
              '#9933ff',
              '#00cccc',
            ];
            const currentIdx = colors.indexOf(attrs.color);
            const nextColor = colors[(currentIdx + 1) % colors.length];
            run({ command: 'forecolor', value: nextColor });
          }}
        >
          <View style={[styles.colorSwatch, { backgroundColor: attrs.color }]} />
        </TouchableOpacity>

        <Divider />

        {/* Alignment */}
        <ToggleButton
          label="Align Left"
          active={attrs.align === 'left'}
          onPress={() => run({ command: 'align', value: 'left' })}
        >
          <AlignLeftIcon />
        </ToggleButton>
        <ToggleButton
          label="Align Center"
          active={attrs.align === 'center'}
          onPress={() => run({ command: 'align', value: 'center' })}
        >
          <AlignCenterIcon />
        </ToggleButton>
        <ToggleButton
          label="Align Right"
          active={attrs.align === 'right'}
          onPress={() => run({ command: 'align', value: 'right' })}
        >
          <AlignRightIcon />
        </ToggleButton>

        {/* Bullet list */}
        <ToggleButton
          label="Bullet List"
          active={attrs.bulletList}
          onPress={() => run({ command: 'bulletList' })}
        >
          <ListIcon />
        </ToggleButton>
      </ScrollView>

      {/* Font picker modal */}
      <Modal visible={fontPickerOpen} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setFontPickerOpen(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Font</Text>
            <ScrollView style={styles.modalScroll}>
              {FONTS.map((f) => (
                <TouchableOpacity
                  key={f.value || '__default__'}
                  style={[styles.modalItem, attrs.fontname === f.value && styles.modalItemActive]}
                  onPress={() => {
                    run({ command: 'fontname', value: f.value });
                    setFontPickerOpen(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{f.label}</Text>
                  {attrs.fontname === f.value && <Text style={styles.modalItemCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/**
 * Connected variant — subscribes to live richTextAttrs from the store.
 */
export function ConnectedRNTextFormatBar({ elementId }: { elementId: string }) {
  return <RNTextFormatBar elementId={elementId} />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(245,245,245,0.95)' : 'rgba(245,245,245,0.98)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d0d0d0',
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  fontPicker: {
    backgroundColor: '#e8e8e8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 100,
    maxWidth: 140,
  },
  fontPickerText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 6,
    overflow: 'hidden',
  },
  stepperButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperInput: {
    width: 36,
    height: 28,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'android' ? { paddingVertical: 0 } : {}),
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  iconText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  modalScroll: {
    paddingHorizontal: 8,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  modalItemActive: {
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
  },
  modalItemCheck: {
    fontSize: 16,
    color: '#7c3aed',
    fontWeight: '600',
  },
});
