import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { deleteMessage, setMessageRead } from "@/actions/admin";

export const metadata = { title: "Pesan Contact" };

export default async function MessagesAdminPage() {
  const messages = await db.message.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl">Pesan Contact</h1>
      {messages.length === 0 ? <p className="mt-10 text-muted">Belum ada pesan.</p> : (
        <ul className="mt-6 space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`card p-5 ${m.read ? "" : "border-deep bg-white"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {m.name} {!m.read && <span className="badge ml-1.5 align-middle">Baru</span>}
                  </p>
                  <p className="text-sm text-muted">
                    <a className="link" href={`mailto:${m.email}?subject=Balasan dari NADA`}>{m.email}</a> · {formatDateTime(m.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <form action={setMessageRead.bind(null, m.id, !m.read)}>
                    <button className="btn-quiet !min-h-9">{m.read ? "Tandai belum dibaca" : "Tandai sudah dibaca"}</button>
                  </form>
                  <form action={deleteMessage.bind(null, m.id)}><button className="btn-quiet !min-h-9">Hapus</button></form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px]">{m.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
