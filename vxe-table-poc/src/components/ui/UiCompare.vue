<script setup lang="ts">
import { ref, watch } from 'vue'
import { tableSkin } from '../../table-skin/tableSkin'
import TableSkinToggle from '../../table-skin/TableSkinToggle.vue'
import CmsButton from './CmsButton.vue'
import CmsInput from './CmsInput.vue'
import CmsSelect from './CmsSelect.vue'
import CmsTextarea from './CmsTextarea.vue'
import CmsTag from './CmsTag.vue'
import CmsDialog from './CmsDialog.vue'
import CmsPagination from './CmsPagination.vue'

const name = ref('')
const note = ref('')
const store = ref<string>()
const checked = ref(false)
const enabled = ref(false)
const open = ref(false)
const page = ref(1)
const pageSize = ref(20)
const stores = [{ value: 'cau-giay', label: 'Cầu Giấy' }, { value: 'hoan-kiem', label: 'Hoàn Kiếm' }]
watch(tableSkin, () => { open.value = false })
</script>

<template>
  <main class="cms-compare">
    <header class="cms-compare__header">
      <div><h1>So sánh component</h1><p>Chuyển giao diện để xem component CMS-26 và Vxe gốc.</p></div>
      <TableSkinToggle />
    </header>
    <section class="cms-compare__card">
      <h2>Nút và nhãn</h2>
      <div v-if="tableSkin === 'cms'" class="cms-compare__row">
        <CmsButton variant="primary">Lưu</CmsButton><CmsButton>Huỷ</CmsButton><CmsButton variant="danger">Xoá</CmsButton><CmsButton disabled>Đã khoá</CmsButton>
        <CmsTag tone="success">Hoạt động</CmsTag><CmsTag tone="warning">Chờ xử lý</CmsTag><CmsTag tone="danger">Ngừng dùng</CmsTag>
      </div>
      <div v-else class="cms-compare__row">
        <vxe-button status="primary" content="Lưu" /><vxe-button content="Huỷ" /><vxe-button status="danger" content="Xoá" /><vxe-button disabled content="Đã khoá" />
        <vxe-tag status="success" content="Hoạt động" /><vxe-tag status="warning" content="Chờ xử lý" /><vxe-tag status="danger" content="Ngừng dùng" />
      </div>
    </section>
    <section class="cms-compare__card">
      <h2>Trường nhập</h2>
      <div v-if="tableSkin === 'cms'" class="cms-compare__fields">
        <CmsInput v-model="name" label="Tên món" placeholder="Nhập tên món" required />
        <CmsSelect v-model="store" label="Cửa hàng" placeholder="Chọn cửa hàng" :options="stores" />
        <CmsInput label="Mã món" model-value="MON-0001" readonly />
        <CmsInput label="Đã khoá" disabled />
        <CmsTextarea v-model="note" label="Ghi chú" />
      </div>
      <div v-else class="cms-compare__fields">
        <label>Tên món <vxe-input v-model="name" placeholder="Nhập tên món" /></label>
        <label>Cửa hàng <vxe-select v-model="store" placeholder="Chọn cửa hàng" :options="stores" /></label>
        <label>Mã món <vxe-input model-value="MON-0001" readonly /></label>
        <label>Đã khoá <vxe-input disabled /></label>
        <label>Ghi chú <vxe-textarea v-model="note" /></label>
      </div>
      <div v-if="tableSkin === 'vxe'" class="cms-compare__row"><vxe-checkbox v-model="checked" content="Lựa chọn" /><vxe-switch v-model="enabled" /></div>
      <p v-else>Checkbox và công tắc CMS đang chờ component đợt 2.</p>
    </section>
    <section class="cms-compare__card">
      <h2>Hộp thoại</h2>
      <div><CmsButton v-if="tableSkin === 'cms'" @click="open = true">Mở hộp thoại</CmsButton><vxe-button v-else content="Mở hộp thoại" @click="open = true" /></div>
      <CmsDialog v-if="tableSkin === 'cms'" v-model:open="open" title="Xác nhận" description="M muốn tiếp tục thao tác này?">
        <template #footer><CmsButton @click="open = false">Huỷ</CmsButton><CmsButton variant="primary" @click="open = false">Xác nhận</CmsButton></template>
      </CmsDialog>
      <vxe-modal v-else v-model="open" title="Xác nhận" show-footer show-close>
        <template #default>M muốn tiếp tục thao tác này?</template>
        <template #footer><vxe-button content="Huỷ" @click="open = false" /><vxe-button status="primary" content="Xác nhận" @click="open = false" /></template>
      </vxe-modal>
    </section>
    <section class="cms-compare__card">
      <h2>Phân trang</h2>
      <CmsPagination v-if="tableSkin === 'cms'" v-model:page="page" v-model:page-size="pageSize" :total="1234" />
      <vxe-pager v-else v-model:current-page="page" v-model:page-size="pageSize" :total="1234" />
    </section>
  </main>
</template>

<style scoped lang="scss">
.cms-compare { max-width: 70rem; margin: 0 auto; padding: var(--space-24); color: var(--ink); }
.cms-compare__header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: var(--space-16); margin-bottom: var(--space-24); }
.cms-compare__header h1 { margin: 0; font-size: var(--type-page-title-font-size); line-height: var(--type-page-title-line-height); }
.cms-compare__header p, .cms-compare__card p { color: var(--ink-muted); }
.cms-compare__card { display: flex; flex-direction: column; gap: var(--space-16); padding: var(--space-16); margin-bottom: var(--space-16); border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface); }
.cms-compare__card h2 { margin: 0; font-size: var(--type-card-title-font-size); line-height: var(--type-card-title-line-height); }
.cms-compare__row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-12); }
.cms-compare__fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: var(--space-16); }
.cms-compare__fields label { display: flex; flex-direction: column; gap: var(--space-6); }
</style>
