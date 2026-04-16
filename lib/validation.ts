import { z } from "zod";

export function isValidCPF(cpf: string) {
  const normalized = cpf.replace(/\D/g, "");
  if (normalized.length !== 11 || /^(\d)\1+$/.test(normalized)) return false;

  const calc = (base: string, factor: number) => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor--;
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const digit1 = calc(normalized.slice(0, 9), 10);
  const digit2 = calc(normalized.slice(0, 10), 11);

  return digit1 === Number(normalized[9]) && digit2 === Number(normalized[10]);
}

export const studentSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  email: z.string().email("E-mail inválido")
});
