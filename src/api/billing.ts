import { getClient } from './client';

export async function getSubscription() {
  const res = await getClient().get('/billing/subscription');
  return res.data;
}

export async function getUsage() {
  const res = await getClient().get('/billing/usage');
  return res.data;
}
