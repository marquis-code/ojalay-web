import { payrollApi } from '~/api/factories/payrollApi';
import type { PayrollRun } from '~/types';

export function usePayroll() {
  const runs = ref<PayrollRun[]>([]);
  const selected = ref<PayrollRun | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  async function load() {
    loading.value = true;
    try { runs.value = await payrollApi.runs(); if (!selected.value && runs.value[0]) selected.value = runs.value[0]; }
    finally { loading.value = false; }
  }
  async function generate(period: string) {
    saving.value = true;
    try { const run = await payrollApi.generate(period); await load(); selected.value = run; return run; }
    finally { saving.value = false; }
  }
  async function updateItem(runId: string, providerId: string, payload: { adjustmentKobo?: number; deductionKobo?: number; note?: string }) {
    saving.value = true;
    try { const run = await payrollApi.updateItem(runId, providerId, payload); selected.value = run; await load(); return run; }
    finally { saving.value = false; }
  }
  async function approve(id: string) {
    saving.value = true;
    try { const run = await payrollApi.approve(id); selected.value = run; await load(); return run; }
    finally { saving.value = false; }
  }
  async function pay(id: string) {
    saving.value = true;
    try { const run = await payrollApi.pay(id); selected.value = run; await load(); return run; }
    finally { saving.value = false; }
  }
  async function verify(id: string) {
    saving.value = true;
    try { const run = await payrollApi.verify(id); selected.value = run; await load(); return run; }
    finally { saving.value = false; }
  }
  async function cancel(id: string) {
    saving.value = true;
    try { const run = await payrollApi.cancel(id); selected.value = run; await load(); return run; }
    finally { saving.value = false; }
  }
  return { runs, selected, loading, saving, load, generate, updateItem, approve, pay, verify, cancel };
}
