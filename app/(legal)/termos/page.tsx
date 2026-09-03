import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Condições de uso do AreaVon.",
};

export default function TermsOfUsePage() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2>1. Aceitação</h2>
      <p>
        Ao criar uma conta e usar o AreaVon, você concorda com estes Termos e com a{" "}
        <a href="/privacidade" className="underline underline-offset-2">
          Política de Privacidade
        </a>
        .
      </p>

      <h2>2. Natureza determinística do produto</h2>
      <p>
        Toda descoberta de empresas, deduplicação, verificação de website e cálculo de Lead Score
        são realizados por regras de código determinísticas — não há uso de inteligência
        artificial, machine learning ou LLMs em nenhuma parte do produto.
      </p>

      <h2>3. Sobre o status de website</h2>
      <p>
        O AreaVon nunca afirma que uma empresa não possui website. A ausência de um
        campo de website nas fontes públicas consultadas não prova a ausência real de um site —
        por isso o produto sempre comunica isso como{" "}
        <strong>&quot;website não encontrado na fonte consultada&quot;</strong>.
      </p>

      <h2>4. Uso permitido</h2>
      <ul>
        <li>Uso interno para prospecção comercial legítima da sua equipe.</li>
        <li>Proibido usar o produto para scraping agressivo de terceiros fora das APIs suportadas.</li>
        <li>Proibido coletar ou inserir dados pessoais de indivíduos no sistema.</li>
      </ul>

      <h2>5. Contas e segurança</h2>
      <p>
        Você é responsável por manter a confidencialidade da sua senha. Atividades suspeitas
        podem levar à suspensão da conta.
      </p>

      <h2>6. Limitação de responsabilidade</h2>
      <p>
        Os dados exibidos vêm de fontes públicas de terceiros (OpenStreetMap, Google Places) e
        podem estar desatualizados ou incompletos. O AreaVon não garante a exatidão
        absoluta das informações exibidas.
      </p>

      <h2>7. Alterações</h2>
      <p>Estes Termos podem ser atualizados periodicamente. O uso contínuo do produto após uma
      atualização implica aceitação dos novos termos.</p>

      <p className="text-xs">
        Este documento é um modelo de referência e deve ser revisado por um profissional jurídico
        antes de uso em produção real.
      </p>
    </>
  );
}
