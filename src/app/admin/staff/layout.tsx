import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Agent Management | Admin Panel",
    description: "Manage field staff, performance, and access levels",
};

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
