
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Customers | Admin Panel",
    description: "Manage customer profiles and payment history",
};

export default function CustomersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
