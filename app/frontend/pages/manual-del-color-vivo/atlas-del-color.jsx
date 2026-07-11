import ManualLayout from '@/components/ManualLayout'
import atlas121 from '@/assets/manual/atlas-121.jpg'
import atlas122 from '@/assets/manual/atlas-122.jpg'
import atlas123 from '@/assets/manual/atlas-123.jpg'
import atlas124 from '@/assets/manual/atlas-124.jpg'
import atlas125 from '@/assets/manual/atlas-125.jpg'
import atlas126 from '@/assets/manual/atlas-126.jpg'
import atlas127 from '@/assets/manual/atlas-127.jpg'
import atlas128 from '@/assets/manual/atlas-128.jpg'
import atlas129 from '@/assets/manual/atlas-129.jpg'
import atlas130 from '@/assets/manual/atlas-130.jpg'

const pages = [atlas121, atlas122, atlas123, atlas124, atlas125, atlas126, atlas127, atlas128, atlas129, atlas130]

export default function Page({ title }) {
  return (
    <ManualLayout title={title}>
      <div className="space-y-8">
        {pages.map((page, index) => (
          <img
            key={page}
            className="h-auto w-full border border-blue/10"
            src={page}
            alt={`Atlas del color, página ${index + 1} de ${pages.length}`}
            width="1400"
            height="2159"
          />
        ))}
      </div>
    </ManualLayout>
  )
}
