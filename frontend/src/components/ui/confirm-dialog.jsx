import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTranslation } from 'react-i18next'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  confirmClassName = 'bg-[#E05252] text-white hover:bg-[#C73F3F]'
}) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language?.startsWith('ar')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        dir={i18n.dir()}
        className="max-w-md border-[#9EC9C2] bg-gradient-to-br from-[#F2FBF8] via-[#FBFEFD] to-[#EEF6FF] shadow-[0_24px_70px_rgba(26,46,44,0.22)]"
      >
        <AlertDialogHeader
          className={`rounded-2xl border border-[#D8ECE8] bg-gradient-to-r from-[#1A7A6E] to-[#4F9EA2] px-5 py-4 shadow-sm ${isArabic ? 'text-right sm:items-end' : 'text-left sm:items-start'}`}
        >
          <AlertDialogTitle className="break-words text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription className="break-words whitespace-normal leading-7 text-white/80">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 rounded-xl bg-white/70 p-1.5 backdrop-blur-sm sm:justify-end">
          <AlertDialogCancel className="w-full border-[#C5E0DC] text-[#5F7D79] hover:bg-[#F4FAFA] sm:w-auto">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction className={`w-full ${confirmClassName} sm:w-auto`} onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
