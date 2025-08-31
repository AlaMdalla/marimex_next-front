import Link from "next/link"

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Welcome to the admin area. Choose an action:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link className="text-primary underline underline-offset-4" href="/admin/products">Manage products</Link>
        </li>
      </ul>
    </div>
  )
}
