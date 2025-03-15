import CTFRegisterForm from "@/components/CTFRegisterForm"

export default async function CTFRegisterPage({ params }: { params: Promise<{id: string}> }) {
    const ctfId = (await params).id.split("/")[0]
    return <>
        <h1 className="text-center text-[2rem] mb-6">CTF Registration</h1>
        <CTFRegisterForm ctfId={ctfId} />
    </>
}