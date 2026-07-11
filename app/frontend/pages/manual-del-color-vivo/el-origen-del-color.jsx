import ManualLayout from '@/components/ManualLayout'
import PartDivider from '@/components/manual/PartDivider'
import divider from '@/assets/manual/divider-el-origen-del-color.jpg'

export default function Page({ title }) {
  return (
    <ManualLayout title={title} hideTitle>
      <PartDivider image={divider} title={title} />
    </ManualLayout>
  )
}
