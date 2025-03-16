import { CTFLoginForm } from "@/components/UserForms"

export default async function CTFLoginPage({ params }: { params: Promise<{id: string}> }) {
    const ctfId = (await params).id.split("/")[0]
    return <>
        <h1 className="text-center text-[2rem] mb-6">CTF Login</h1>
        <CTFLoginForm ctfId={ctfId} />
    </>
}