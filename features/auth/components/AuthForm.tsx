import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '@/components/ui';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onSubmit: (email: string, password: string, name?: string) => Promise<void>;
  loading?: boolean;
}

export function AuthForm({ mode, onSubmit, loading }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    await onSubmit(email, password, mode === 'signup' ? name : undefined);
  };

  return (
    <View className="gap-4">
      {mode === 'signup' ? (
        <View>
          <Text className="text-muted text-sm mb-2">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            className="bg-surface border border-stone-200 rounded-2xl px-4 py-4 text-stone-900"
            placeholderTextColor="#A8A29E"
          />
        </View>
      ) : null}
      <View>
        <Text className="text-muted text-sm mb-2">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-surface border border-stone-200 rounded-2xl px-4 py-4 text-stone-900"
          placeholderTextColor="#A8A29E"
        />
      </View>
      <View>
        <Text className="text-muted text-sm mb-2">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          className="bg-surface border border-stone-200 rounded-2xl px-4 py-4 text-stone-900"
          placeholderTextColor="#A8A29E"
        />
      </View>
      <PrimaryButton
        title={mode === 'login' ? 'Sign in' : 'Create account'}
        onPress={handleSubmit}
        loading={loading}
        className="mt-2"
      />
    </View>
  );
}
