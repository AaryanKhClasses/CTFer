import { CTFRegisterForm } from "@/components/UserForms"

export default async function CTFRegisterPage({ params }: { params: Promise<{id: string}> }) {
    const ctfId = (await params).id.split("/")[0]
    return <>
        <h1 className="text-[2rem] text-center font-bold my-5">./<b className="green">register</b></h1>
        <CTFRegisterForm ctfId={ctfId} />
    </>
}