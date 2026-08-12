import { useApp } from '../context/AppContext'
import { tr } from '../lib/i18n'
import strings from '../data/strings.json'
import { PackageCard } from '../components/PackageCard'

export function Packages({ onOpenPackage }: { onOpenPackage: (id: number) => void }) {
  const { packages, lang } = useApp()

  return (
    <div>
      <h1>{tr(strings.packagesScreen.title, lang)}</h1>
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} onSelect={() => onOpenPackage(pkg.id)} />
      ))}
    </div>
  )
}
