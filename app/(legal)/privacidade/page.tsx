import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o CodeVision Radar trata dados de contas e de estabelecimentos públicos.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

      <h2>1. Quem somos</h2>
      <p>
        O CodeVision Radar é uma ferramenta interna de prospecção comercial. Este documento
        descreve, de forma transparente, quais dados tratamos e como.
      </p>

      <h2>2. Dados de conta</h2>
      <p>
        Para usar o produto, criamos uma conta com o seu e-mail e uma senha (armazenada com hash
        bcrypt, nunca em texto plano). Não coletamos outros dados pessoais no cadastro.
      </p>

      <h2>3. Dados de estabelecimentos (não são dados pessoais)</h2>
      <p>
        O Radar consulta exclusivamente fontes públicas de dados de estabelecimentos comerciais —
        OpenStreetMap e, opcionalmente, Google Places — para obter nome, categoria, morada,
        telefone comercial, avaliações e presença digital pública de empresas. Não coletamos,
        processamos ou armazenamos dados pessoais de indivíduos.
      </p>

      <h2>4. Retenção de dados de terceiros</h2>
      <p>
        Dados vindos do Google Places seguem os Termos de Uso do Google Maps Platform quanto a
        prazos de retenção: o identificador do local (Place ID) pode ser retido indefinidamente,
        mas os demais campos (nome, telefone, rating, website etc.) têm validade limitada e são
        revalidados periodicamente.
      </p>

      <h2>5. Cookies e sessão</h2>
      <p>
        Usamos um único cookie de sessão, assinado e <code>httpOnly</code>, para manter você
        autenticado. Não usamos cookies de rastreamento ou publicidade.
      </p>

      <h2>6. Logs de auditoria</h2>
      <p>
        Ações sensíveis (login, criação/edição de leads, mudanças de estágio no kanban,
        exportações) são registradas em um log de auditoria interno, para fins de segurança e
        rastreabilidade.
      </p>

      <h2>7. Seus direitos</h2>
      <p>
        Você pode solicitar a exclusão da sua conta e dos dados associados a qualquer momento,
        entrando em contato com o administrador do sistema.
      </p>

      <h2>8. Contato</h2>
      <p>Dúvidas sobre esta política podem ser encaminhadas ao administrador da sua organização.</p>

      <p className="text-xs">
        Este documento é um modelo de referência e deve ser revisado por um profissional jurídico
        antes de uso em produção real.
      </p>
    </>
  );
}
