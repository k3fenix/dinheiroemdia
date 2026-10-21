import { describe, it, expect } from 'vitest';
import {
  calculateVariance,
  calculatePotentialSavings,
  calculateEffectiveSavings,
  calculateGoalProgress,
  evaluateBudgetThreshold,
} from '../lib/math/financial';

describe('Cálculos Financeiros Determinísticos — Cadê Meu Dinheiro?', () => {
  describe('Cálculo de Variação Absoluta e Percentual (Seção 9.3)', () => {
    it('deve calcular corretamente a variação quando o mês anterior foi de R$ 320 e atual foi de R$ 420', () => {
      const res = calculateVariance(420, 320);
      expect(res.absolute).toBe(100);
      expect(res.percentage).toBe(31.25);
    });

    it('deve retornar percentual nulo quando o valor anterior for zero, sem calcular porcentagem enganosa', () => {
      const res = calculateVariance(150, 0);
      expect(res.absolute).toBe(150);
      expect(res.percentage).toBeNull();
      expect(res.explanation).toContain('Sem base anterior positiva para cálculo percentual');
    });

    it('deve calcular reduções (valores negativos)', () => {
      const res = calculateVariance(300, 400);
      expect(res.absolute).toBe(-100);
      expect(res.percentage).toBe(-25);
    });
  });

  describe('Economia Potencial Estimada vs Economia Efetiva Confirmada', () => {
    it('deve calcular a economia potencial limitando a zero quando o gasto alvo for superior', () => {
      // Gasto de referência R$ 420, meta R$ 350 -> potencial R$ 70
      const pot = calculatePotentialSavings(420, 350);
      expect(pot).toBe(70);

      // Meta superior ao gasto atual -> potencial deve ser zero
      const zeroPot = calculatePotentialSavings(300, 350);
      expect(zeroPot).toBe(0);
    });

    it('deve calcular a economia efetiva confirmada comprovada entre referência e realizado', () => {
      // Referência R$ 420, realizado R$ 345 -> economia confirmada R$ 75
      const eff = calculateEffectiveSavings(420, 345);
      expect(eff).toBe(75);
    });
  });

  describe('Progresso de Metas Financeiras (Seção 11)', () => {
    it('deve calcular o percentual e saldo restante de uma meta de R$ 5.000 com R$ 2.000 acumulados', () => {
      const progress = calculateGoalProgress(2000, 5000);
      expect(progress.percentage).toBe(40);
      expect(progress.remainingAmount).toBe(3000);
      expect(progress.isCompleted).toBe(false);
    });

    it('deve marcar meta como concluída quando o acumulado for igual ou superior ao alvo', () => {
      const progress = calculateGoalProgress(5200, 5000);
      expect(progress.percentage).toBe(100);
      expect(progress.remainingAmount).toBe(0);
      expect(progress.isCompleted).toBe(true);
    });
  });

  describe('Consumo de Orçamento e Alertas de 50%, 80% e 100% (Seção 10)', () => {
    it('deve indicar status normal quando o gasto estiver abaixo de 50%', () => {
      const res = evaluateBudgetThreshold(400, 1000);
      expect(res.status).toBe('normal');
      expect(res.percentage).toBe(40);
      expect(res.remaining).toBe(600);
    });

    it('deve disparar alerta de 50% quando o gasto estiver entre 50% e 79.9%', () => {
      const res = evaluateBudgetThreshold(650, 1000);
      expect(res.status).toBe('alerta_50');
      expect(res.percentage).toBe(65);
    });

    it('deve disparar alerta de 80% quando o gasto estiver entre 80% e 99.9%', () => {
      const res = evaluateBudgetThreshold(850, 1000);
      expect(res.status).toBe('alerta_80');
      expect(res.percentage).toBe(85);
    });

    it('deve disparar alerta de estourado quando o gasto for igual ou superior a 100%', () => {
      const res = evaluateBudgetThreshold(1150, 1000);
      expect(res.status).toBe('estourado');
      expect(res.percentage).toBe(115);
      expect(res.remaining).toBe(-150);
    });
  });
});
