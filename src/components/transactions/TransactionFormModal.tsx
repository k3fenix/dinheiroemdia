'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Category, Transaction } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'income' | 'expense';
  categories: Category[];
  editingTransaction?: Transaction | null;
}

export default function TransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'expense',
  categories,
  editingTransaction,
}: TransactionFormModalProps) {
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [competenceDate, setCompetenceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'prevista' | 'pendente' | 'paga' | 'cancelada'>('paga');
  const [expenseType, setExpenseType] = useState<'fixa' | 'variavel' | 'recorrente'>('variavel');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient();

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.category_id || '');
      setCompetenceDate(editingTransaction.competence_date);
      setDueDate(editingTransaction.due_date || '');
      setStatus(editingTransaction.status);
      setExpenseType(editingTransaction.expense_type);
      setNotes(editingTransaction.notes || '');
      setIsRecurring(!!editingTransaction.recurrence_id);
    } else {
      setType(initialType);
      setDescription('');
      setAmount('');
      setCategoryId('');
      const today = new Date().toISOString().split('T')[0];
      setCompetenceDate(today);
      setDueDate(today);
      setStatus(initialType === 'income' ? 'paga' : 'paga');
      setExpenseType('variavel');
      setNotes('');
      setIsRecurring(false);
    }
    setErrorMsg('');
  }, [editingTransaction, initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim()) {
      setErrorMsg('Por favor, informe a descrição do lançamento.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Informe um valor monetário válido maior que zero.');
      return;
    }
    if (!competenceDate) {
      setErrorMsg('Informe a data de competência.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada. Faça login novamente.');

      const payload = {
        user_id: user.id,
        category_id: categoryId || null,
        type,
        description: description.trim(),
        amount: numericAmount,
        competence_date: competenceDate,
        due_date: type === 'expense' && dueDate ? dueDate : null,
        paid_at: status === 'paga' ? new Date().toISOString() : null,
        status,
        expense_type: type === 'expense' ? expenseType : 'variavel',
        notes: notes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', editingTransaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transactions').insert([payload]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar o lançamento.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 touch-target"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tipo: Receita ou Despesa */}
        <div className="p-6 space-y-4">
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setStatus('paga');
                }}
                className={`py-2 text-sm font-bold rounded-lg transition ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Despesa (Saída)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setStatus('paga');
                }}
                className={`py-2 text-sm font-bold rounded-lg transition ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Receita (Entrada)
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start space-x-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Descrição <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={type === 'expense' ? 'Ex: Compras Supermercado, Aluguel' : 'Ex: Salário, Projeto Freelance'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              />
            </div>

            {/* Valor e Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Valor (R$) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">R$</span>
                  <input
                    type="text"
                    required
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white"
                >
                  <option value="">Selecione uma categoria...</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Data de Competência <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={competenceDate}
                  onChange={(e) => setCompetenceDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white"
                />
              </div>

              {type === 'expense' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white"
                  />
                </div>
              )}
            </div>

            {/* Situação e Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Situação
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white"
                >
                  <option value="paga">{type === 'income' ? 'Recebido' : 'Paga'}</option>
                  <option value="pendente">{type === 'income' ? 'A Receber' : 'Pendente (A Pagar)'}</option>
                  <option value="prevista">Apenas Prevista</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {type === 'expense' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Despesa
                  </label>
                  <select
                    value={expenseType}
                    onChange={(e: any) => setExpenseType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white"
                  >
                    <option value="variavel">Variável (Dia a dia)</option>
                    <option value="fixa">Fixa (Moradia, Contas)</option>
                    <option value="recorrente">Recorrente / Assinatura</option>
                  </select>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Observações (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes adicionais, forma de pagamento, etc."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              />
            </div>

            {/* Botões de Ação */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-xs transition ${
                  type === 'expense'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {loading ? 'Salvando...' : editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
