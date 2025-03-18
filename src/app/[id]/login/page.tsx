import { CTFLoginForm } from "@/components/UserForms"

export default async function CTFLoginPage({ params }: { params: Promise<{id: string}> }) {
    const ctfId = (await params).id.split("/")[0]
    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./<b className="green">login</b></h1>
        <CTFLoginForm ctfId={ctfId} />
    </>
}