
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Expenses & Dealers | Admin Panel",
    description: "Track office expenses and manage dealer payments",
};

export default function ExpensesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
