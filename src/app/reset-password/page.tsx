import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <h1 className="mb-6 text-2xl font-bold">Redefinir senha</h1>
        {!token ? (
          <p className="text-sm text-red-600">Token não informado.</p>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </div>
    </main>
  );
}
