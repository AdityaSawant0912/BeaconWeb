import Header from "@/components/header";
import Link from "next/link";

export default function HomePage() {
    return (
        <div>
            <Header />
            <Link href={'/map'}> Map </Link>
        </div>
    )
}
