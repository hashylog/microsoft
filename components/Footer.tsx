import { MEDIA, type MediaSlotId } from "@/lib/media";

export function Footer() {
  const slots = Object.entries(MEDIA) as [MediaSlotId, (typeof MEDIA)[MediaSlotId]][];
  const ready = slots.filter(([, spec]) => spec.source).length;

  return (
    <footer className="border-t border-[var(--line)] px-4 pt-16 pb-24 md:px-12 md:pb-16">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="text-base font-semibold">Sobre este projeto</p>
          <p className="t-body mt-3">
            Trabalho acadêmico desenvolvido por estudantes que receberam a Microsoft como tema em um sorteio da
            instituição de ensino. Não há vínculo, parceria ou afiliação com a Microsoft. Marcas citadas pertencem aos
            seus respectivos donos.
          </p>
        </div>

        <details className="group md:col-span-6 md:col-start-7">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 rounded-sm text-base font-semibold">
            Mídias do wireframe
            <span className="text-sm font-normal text-[var(--mute)] tabular-nums">
              {ready} de {slots.length} prontas
            </span>
          </summary>
          <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {slots.map(([id, spec]) => (
              <li key={id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5 py-2.5 text-sm">
                <span className="font-mono text-xs leading-5">{id}</span>
                <span className={spec.source ? "text-[var(--ms-green)]" : "text-[var(--mute)]"}>
                  {spec.source ? "Pronta" : "Pendente"}
                </span>
                <span className="col-span-2 text-[var(--mute)]">{spec.description}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
