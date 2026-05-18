import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, PrimaryButton, ScreenHeader, UsageIntervalPicker } from '@/components/ui';
import { useProducts } from '@/hooks/useProducts';
import { data } from '@/services/data-provider';
import { useQueryClient } from '@tanstack/react-query';
import { todayISO } from '@/utils/dates';
import { confirmAction, showMessage } from '@/utils/confirm';
import {
  formatUsageInterval,
  normalizeUsageInterval,
  parseIntervalInput,
} from '@/utils/product-schedule';
import type { Product } from '@/types';
import { track } from '@/lib/analytics';

function ProductRow({
  product,
  onDelete,
  onUpdateInterval,
  deleting,
  savingInterval,
}: {
  product: Product;
  onDelete: () => void;
  onUpdateInterval: (days: number) => void;
  deleting?: boolean;
  savingInterval?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const normalizedDays = normalizeUsageInterval(product.usage_interval_days);
  const [intervalText, setIntervalText] = useState(String(normalizedDays));

  useEffect(() => {
    setIntervalText(String(normalizedDays));
  }, [product.id, normalizedDays]);

  const saveInterval = () => {
    const parsed = parseIntervalInput(intervalText);
    if (parsed === null) {
      showMessage('Invalid interval', 'Enter a number between 1 and 90.');
      return;
    }
    onUpdateInterval(parsed);
    setEditing(false);
  };

  return (
    <View className="py-3 border-b border-stone-100">
      <View className="flex-row items-center">
        <View className="flex-1 pr-3">
          <Text className="text-ink font-semibold text-base">{product.name}</Text>
          <Text className="text-muted text-sm mt-0.5">{product.brand || 'No brand'}</Text>
          <Pressable onPress={() => setEditing((v) => !v)} className="mt-1">
            <Text className="text-pink-dark text-sm font-medium">
              {formatUsageInterval(normalizedDays)}
              {editing ? '' : ' · Edit schedule'}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onDelete}
          disabled={deleting}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${product.name}`}
          style={({ pressed }) => ({
            padding: 10,
            opacity: deleting ? 0.4 : pressed ? 0.6 : 1,
            ...(Platform.OS === 'web' ? { cursor: deleting ? 'default' : 'pointer' } : {}),
          })}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#A8A29E" />
          ) : (
            <View pointerEvents="none">
              <Ionicons name="trash-outline" size={22} color="#A8A29E" />
            </View>
          )}
        </Pressable>
      </View>
      {editing ? (
        <View className="mt-3 pt-3 border-t border-stone-100">
          <UsageIntervalPicker
            value={intervalText}
            onChangeValue={setIntervalText}
          />
          <PrimaryButton
            title="Save schedule"
            onPress={saveInterval}
            loading={savingInterval}
            disabled={savingInterval}
            className="mt-3"
          />
        </View>
      ) : null}
    </View>
  );
}

export default function ManageRoutineScreen() {
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [stepType, setStepType] = useState('');
  const [brand, setBrand] = useState('');
  const [routineType, setRoutineType] = useState<'morning' | 'night'>('morning');
  const [intervalText, setIntervalText] = useState('1');
  const [intervalError, setIntervalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingIntervalId, setUpdatingIntervalId] = useState<string | null>(null);

  const morning = products?.filter((p) => p.routine_type === 'morning') ?? [];
  const night = products?.filter((p) => p.routine_type === 'night') ?? [];

  const refreshProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['routine', 'today'] });
  };

  const handleAdd = async () => {
    if (!stepType.trim() || !brand.trim()) {
      showMessage('Missing info', 'Enter both the step type and brand.');
      return;
    }
    const interval = parseIntervalInput(intervalText);
    if (interval === null) {
      setIntervalError('Enter a number between 1 and 90.');
      return;
    }
    setIntervalError(null);
    setSaving(true);
    try {
      await data.addProduct({
        name: stepType.trim(),
        brand: brand.trim(),
        routine_type: routineType,
        started_at: todayISO(),
        usage_interval_days: interval,
      });
      track('routine_product_added', { routine_type: routineType, usage_interval_days: interval });
      setStepType('');
      setBrand('');
      setIntervalText('1');
      await refreshProducts();
    } catch (e) {
      showMessage('Could not add', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInterval = async (id: string, days: number) => {
    setUpdatingIntervalId(id);
    try {
      await data.updateProduct(id, { usage_interval_days: days });
      await refreshProducts();
    } catch (e) {
      showMessage('Could not update', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setUpdatingIntervalId(null);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    const confirmed = await confirmAction(
      'Remove product',
      `Remove "${label}" from your routine?`,
      'Remove',
      true
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await data.deleteProduct(id);
      track('routine_product_deleted');
      await refreshProducts();
    } catch (e) {
      showMessage('Could not remove', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <ScreenHeader title="My products" showBack />

        <Text className="text-muted text-base leading-6 mb-6 -mt-2">
          Set how often you use each step. Your routine log only asks for products that are due
          today.
        </Text>

        {isLoading ? (
          <Text className="text-muted mb-6">Loading…</Text>
        ) : (
          <>
            <Card className="mb-5">
              <Text className="text-ink font-bold mb-2">☀️ Morning</Text>
              {morning.length === 0 ? (
                <Text className="text-muted text-sm py-2">No morning products</Text>
              ) : (
                morning.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    deleting={deletingId === p.id}
                    savingInterval={updatingIntervalId === p.id}
                    onDelete={() => void handleDelete(p.id, p.name)}
                    onUpdateInterval={(days) => void handleUpdateInterval(p.id, days)}
                  />
                ))
              )}
            </Card>

            <Card className="mb-6">
              <Text className="text-ink font-bold mb-2">🌙 Night</Text>
              {night.length === 0 ? (
                <Text className="text-muted text-sm py-2">No night products</Text>
              ) : (
                night.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    deleting={deletingId === p.id}
                    savingInterval={updatingIntervalId === p.id}
                    onDelete={() => void handleDelete(p.id, p.name)}
                    onUpdateInterval={(days) => void handleUpdateInterval(p.id, days)}
                  />
                ))
              )}
            </Card>
          </>
        )}

        <Text className="text-ink font-bold mb-3">Add product</Text>
        <View className="flex-row gap-2 mb-3">
          {(['morning', 'night'] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setRoutineType(type)}
              className={`flex-1 py-3 rounded-2xl border items-center ${
                routineType === type ? 'bg-pink border-pink' : 'bg-surface border-stone-200'
              }`}
            >
              <Text className={routineType === type ? 'text-ink font-bold' : 'text-muted'}>
                {type === 'morning' ? 'Morning' : 'Night'}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={stepType}
          onChangeText={setStepType}
          placeholder="Step type (e.g. Cleanser)"
          className="bg-surface border border-stone-200 rounded-2xl px-4 py-3 mb-3 text-ink"
          placeholderTextColor="#8A8580"
        />
        <TextInput
          value={brand}
          onChangeText={setBrand}
          placeholder="Brand (e.g. CeraVe)"
          className="bg-surface border border-stone-200 rounded-2xl px-4 py-3 mb-4 text-ink"
          placeholderTextColor="#8A8580"
        />
        <UsageIntervalPicker
          value={intervalText}
          onChangeValue={(text) => {
            setIntervalText(text);
            setIntervalError(null);
          }}
          error={intervalError}
        />
        <PrimaryButton
          title="Add to routine"
          onPress={handleAdd}
          loading={saving}
          disabled={saving}
          className="mt-4"
        />

        <PrimaryButton
          title="Back to routine log"
          variant="ghost"
          onPress={() => router.back()}
          className="mt-4 mb-10"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
