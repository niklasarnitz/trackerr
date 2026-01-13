import { LoansContent } from "~/components/loans-content";

export default async function LoansPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-2">Loans</h1>
        <p className="text-muted-foreground body-md">
          Track which physical media you loaned out.
        </p>
      </div>
      <LoansContent />
    </div>
  );
}
