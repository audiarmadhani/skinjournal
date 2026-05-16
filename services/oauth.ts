import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { getSupabase } from '@/lib/supabase';
import { data } from './data-provider';

WebBrowser.maybeCompleteAuthSession();

export const oauthRedirectUri = makeRedirectUri({
  scheme: 'skinjournal',
  path: 'auth/callback',
});

async function createSessionFromUrl(url: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured');

  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;

  if (!access_token) {
    throw new Error('Sign in was cancelled or the redirect URL did not include a session.');
  }

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
}

export async function signInWithOAuth() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured. Check your .env file.');
  }

  const { data: oauth, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: oauthRedirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!oauth?.url) throw new Error('Could not start sign in. Is the provider enabled in Supabase?');

  const result = await WebBrowser.openAuthSessionAsync(oauth.url, oauthRedirectUri);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Sign in was cancelled');
  }

  if (result.type !== 'success') {
    throw new Error('Sign in failed. Try again.');
  }

  await createSessionFromUrl(result.url);
  await data.ensureProfile();
}
