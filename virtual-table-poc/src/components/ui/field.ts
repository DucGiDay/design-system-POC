import { computed, useAttrs } from 'vue'

/** Props chung của CmsInput / CmsTextarea / CmsSelect, chuyển thẳng xuống CmsField */
export interface FieldProps {
  label?: string
  required?: boolean
  /** Dòng gợi ý dưới ô, ẩn khi đang có lỗi */
  hint?: string
  /** Có nội dung thì ô chuyển sang trạng thái lỗi */
  error?: string
  readonly?: boolean
  disabled?: boolean
}

/**
 * Tách attrs: class/style ở lại khung ngoài (để nơi dùng chỉnh bố cục),
 * phần còn lại (name, autocomplete, maxlength…) đi vào phần tử nhập thật.
 */
export function useFieldAttrs() {
  const attrs = useAttrs()
  const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
  const controlAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrs
    return rest
  })
  return { rootAttrs, controlAttrs }
}
